import json
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.contenttypes.models import ContentType
from .models import Message
from accounts.models import ClientToken, BusinessSubjectToken


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_string = parse_qs(self.scope["query_string"].decode())
        token = query_string.get("token", [None])[0]

        user = await self.authenticate_user(token)
        if user is None:
            await self.close()
            return

        self.scope["user"] = user
        self.room_group_name = f"chat_{user.id}"  # Define a chat room based on user ID

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
            return None  # Invalid token

    async def disconnect(self, close_code):
        # Leave the chat group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        sender_id = data["sender_id"]
        sender_type = data["sender_type"]
        receiver_id = data["receiver_id"]
        receiver_type = data["receiver_type"]
        content = data["message"]

        # Convert model names to ContentType
        sender_content_type = await sync_to_async(ContentType.objects.get)(model=sender_type)
        receiver_content_type = await sync_to_async(ContentType.objects.get)(model=receiver_type)

        # Save message asynchronously
        message = await sync_to_async(Message.objects.create)(
            sender_content_type=sender_content_type,
            sender_object_id=sender_id,
            receiver_content_type=receiver_content_type,
            receiver_object_id=receiver_id,
            content=content,
        )

        # Send message to WebSocket group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": content,
                "sender": sender_id,
                "receiver": receiver_id,
            },
        )

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))
