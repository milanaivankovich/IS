from channels.generic.websocket import AsyncWebsocketConsumer
import json
from urllib.parse import parse_qs
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from .models import Message
from accounts.models import ClientToken, BusinessSubjectToken

PAGE_SIZE = 10
MAX_BULK_DELETE = 20

User = get_user_model()
online_users = {}  # key = room_group_name, value = set of usernames


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_string = parse_qs(self.scope["query_string"].decode())
        token = query_string.get("token", [None])[0]
        room_name = self.scope["url_route"]["kwargs"]["room_name"]  # Uzeto iz URL-a

        self.user = await self.authenticate_user(token)
        if self.user is None:
            await self.close()
            return

        self.username = self.user.username
        self.room_group_name = f"chatroom_{room_name}"

        if self.room_group_name not in online_users:
            online_users[self.room_group_name] = set()
        online_users[self.room_group_name].add(self.username)

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        await self.broadcast_online_users()

    async def disconnect(self, close_code):
        if self.room_group_name in online_users and self.username in online_users[self.room_group_name]:
            online_users[self.room_group_name].remove(self.username)
            if not online_users[self.room_group_name]:
                del online_users[self.room_group_name]

        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        await self.broadcast_online_users()

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")

        if action == "send_message":
            await self.handle_send_message(data)
        elif action == "fetch_messages":
            await self.handle_fetch_messages(data)
        elif action == "delete_message":
            await self.handle_soft_delete_message(data)
        elif action == "bulk_delete":
            await self.handle_bulk_delete_messages(data)
        elif action == "edit_message":
            await self.handle_edit_message(data)
        elif action == "typing":
            await self.handle_typing(data)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def typing_notification(self, event):
        await self.send(text_data=json.dumps(event))

    async def broadcast_online_users(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "online_users",
                "users": list(online_users.get(self.room_group_name, set())),
            },
        )

    async def online_users(self, event):
        await self.send(text_data=json.dumps({"type": "online_users", "users": event["users"]}))

    async def handle_send_message(self, data):
        sender_id = self.user.id
        receiver_id = data.get("receiver_id")
        content = data.get("message")

        if not content or not receiver_id:
            return

        # Determine receiver content type (client or business subject)
        try:
            receiver_model = "client"  # default
            if await sync_to_async(lambda: User.objects.filter(id=receiver_id).exists())():
                receiver_model = "user"
            elif await sync_to_async(lambda: BusinessSubjectToken.objects.filter(business_subject_id=receiver_id).exists())():
                receiver_model = "businesssubject"

            message = await sync_to_async(Message.objects.create)(
                sender_content_type=ContentType.objects.get_for_model(self.user),
                sender_object_id=sender_id,
                receiver_content_type=ContentType.objects.get(model=receiver_model),
                receiver_object_id=receiver_id,
                content=content,
                room_name=self.room_group_name,
                is_read=False,
                is_deleted=False
            )

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": content,
                    "sender": sender_id,
                    "receiver": receiver_id,
                    "message_id": message.id
                },
            )
        except Exception as e:
            await self.send(text_data=json.dumps({"type": "error", "message": str(e)}))

    async def handle_typing(self, data):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "typing_notification",
                "sender": self.username,
                "is_typing": True
            }
        )

    async def handle_fetch_messages(self, data):
        page = int(data.get("page", 1))
        offset = (page - 1) * PAGE_SIZE
        user = self.user

        query = Message.objects.filter(
            receiver_object_id=user.id,
            is_deleted=False
        )
        total_messages = await sync_to_async(query.count)()

        async def get_and_update_messages():
            messages = list(query.order_by("-timestamp")[offset:offset + PAGE_SIZE])
            Message.objects.filter(id__in=[msg.id for msg in messages]).update(is_read=True)
            return messages

        messages = await sync_to_async(get_and_update_messages)()
        message_list = [
            {
                "id": msg.id,
                "sender": msg.sender_object_id,
                "receiver": msg.receiver_object_id,
                "message": msg.content,
                "timestamp": msg.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "is_read": True
            }
            for msg in messages
        ]

        has_more = (offset + PAGE_SIZE) < total_messages
        await self.send(text_data=json.dumps({
            "type": "message_history",
            "messages": message_list,
            "page": page,
            "has_more": has_more
        }))

    async def handle_soft_delete_message(self, data):
        message_id = data.get("message_id")
        try:
            message = await sync_to_async(Message.objects.get)(id=message_id)
            if message.sender_object_id == self.user.id:
                message.is_deleted = True
                await sync_to_async(message.save)()
                await self.send(text_data=json.dumps({
                    "type": "message_deleted",
                    "message_id": message_id
                }))
        except Message.DoesNotExist:
            pass

    async def handle_bulk_delete_messages(self, data):
        message_ids = data.get("message_ids", [])
        if not message_ids or len(message_ids) > MAX_BULK_DELETE:
            return

        messages = await sync_to_async(list)(Message.objects.filter(
            id__in=message_ids,
            sender_object_id=self.user.id
        ))

        for message in messages:
            message.is_deleted = True

        await sync_to_async(Message.objects.bulk_update)(messages, ["is_deleted"])

        await self.send(text_data=json.dumps({
            "type": "bulk_messages_deleted",
            "message_ids": [msg.id for msg in messages]
        }))

    async def handle_edit_message(self, data):
        message_id = data.get("message_id")
        new_content = data.get("new_content")

        if not message_id or not new_content:
            return

        try:
            message = await sync_to_async(Message.objects.get)(id=message_id)
            if message.sender_object_id == self.user.id:
                message.content = new_content
                await sync_to_async(message.save)()
                await self.send(text_data=json.dumps({
                    "type": "message_edited",
                    "message_id": message_id,
                    "new_content": new_content
                }))
        except Message.DoesNotExist:
            pass

    async def authenticate_user(self, token):
        if not token:
            return None
        try:
            client_token = await sync_to_async(ClientToken.objects.get)(key=token)
            return client_token.client
        except ClientToken.DoesNotExist:
            pass
        try:
            bs_token = await sync_to_async(BusinessSubjectToken.objects.get)(key=token)
            return bs_token.business_subject
        except BusinessSubjectToken.DoesNotExist:
            return None
