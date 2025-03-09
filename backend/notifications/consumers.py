import json 
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'notification'

        # Join the chat group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the chat group
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            if not text_data:
                return  # Ignore empty messages

            data = json.loads(text_data)
            notification_type = data.get("notification_type")  # Type of notification
            message = data.get("message")
            sender = data.get("sender")

            if not notification_type or not message or not sender:
                return  # Ignore invalid data

            # Send notification to the group (all users in the group receive it)
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "send_notification",
                    "notification_type": notification_type,
                    "message": message,
                    "sender": sender,
                },
            )
        except json.JSONDecodeError:
            print("Invalid JSON received")

    async def send_notification(self, event):
        notification_type = event["notification_type"]
        message = event["message"]
        sender = event["sender"]

        # Send the notification to the WebSocket
        await self.send(text_data=json.dumps({
            "notification_type": notification_type,
            "message": message,
            "sender": sender,
        }))