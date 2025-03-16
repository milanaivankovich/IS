import json
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.contenttypes.models import ContentType
from .models import Message
from accounts.models import ClientToken, BusinessSubjectToken

PAGE_SIZE = 10  
MAX_BULK_DELETE = 20  

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_string = parse_qs(self.scope["query_string"].decode())
        token = query_string.get("token", [None])[0]

        user = await self.authenticate_user(token)
        if user is None:
            await self.close()
            return

        self.scope["user"] = user
        self.room_group_name = f"chat_{user.id}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

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

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")

        if action == "send_message":
            await self.handle_send_message(data)
        elif action == "fetch_messages":
            await self.handle_fetch_messages(data)
        elif action == "delete_message":
            await self.handle_soft_delete_message(data)
        elif action == "bulk_delete_messages":
            await self.handle_bulk_delete_messages(data)
        elif action == "edit_message":
            await self.handle_edit_message(data)

    async def handle_send_message(self, data):
        sender_id = data["sender_id"]
        sender_type = data["sender_type"]
        receiver_id = data["receiver_id"]
        receiver_type = data["receiver_type"]
        content = data["message"]

        sender_content_type = await sync_to_async(ContentType.objects.get)(model=sender_type)
        receiver_content_type = await sync_to_async(ContentType.objects.get)(model=receiver_type)

        message = await sync_to_async(Message.objects.create)(
            sender_content_type=sender_content_type,
            sender_object_id=sender_id,
            receiver_content_type=receiver_content_type,
            receiver_object_id=receiver_id,
            content=content,
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

    async def handle_fetch_messages(self, data):
        user = self.scope["user"]
        page = int(data.get("page", 1))
        sender_id = data.get("sender_id")
        receiver_id = data.get("receiver_id")
        unread_only = data.get("unread_only", False)

        offset = (page - 1) * PAGE_SIZE

        query = Message.objects.filter(receiver_object_id=user.id, is_deleted=False)

        if sender_id:
            query = query.filter(sender_object_id=sender_id)
        if receiver_id:
            query = query.filter(receiver_object_id=receiver_id)
        if unread_only:
            query = query.filter(is_read=False)

        total_messages = await sync_to_async(query.count)()

        async def get_and_update_messages():
            messages = list(query
                            .select_related("sender_content_type", "receiver_content_type")
                            .order_by("-timestamp")[offset:offset + PAGE_SIZE])

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
        user = self.scope["user"]
        message_id = data.get("message_id")

        if not message_id:
            return

        try:
            message = await sync_to_async(Message.objects.get)(id=message_id)
        except Message.DoesNotExist:
            return

        if message.sender_object_id != user.id:
            return  

        message.is_deleted = True
        await sync_to_async(message.save)()

        await self.send(text_data=json.dumps({
            "type": "message_deleted",
            "message_id": message_id
        }))

    async def handle_bulk_delete_messages(self, data):
        user = self.scope["user"]
        message_ids = data.get("message_ids", [])

        if not message_ids or len(message_ids) > MAX_BULK_DELETE:
            return  

        messages = await sync_to_async(list)(Message.objects.filter(id__in=message_ids, sender_object_id=user.id))

        for message in messages:
            message.is_deleted = True

        await sync_to_async(Message.objects.bulk_update)(messages, ["is_deleted"])

        await self.send(text_data=json.dumps({
            "type": "bulk_messages_deleted",
            "message_ids": [msg.id for msg in messages]
        }))

    async def handle_edit_message(self, data):
        user = self.scope["user"]
        message_id = data.get("message_id")
        new_content = data.get("new_content")

        if not message_id or not new_content:
            return

        try:
            message = await sync_to_async(Message.objects.get)(id=message_id)
        except Message.DoesNotExist:
            return

        if message.sender_object_id != user.id:
            return  

        message.content = new_content
        await sync_to_async(message.save)()

        await self.send(text_data=json.dumps({
            "type": "message_edited",
            "message_id": message_id,
            "new_content": new_content
        }))
