import json 
from channels.generic.websocket import AsyncWebsocketConsumer
from .serializers import NotificationSerializer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.group_name = f"notifications_{self.room_name}"
        print(self.room_name + self.group_name)

        # Join the chat group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the chat group
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            if not text_data:
                print("Error: Notification recieved empty text data")
                return  # Ignore empty messages

            data = json.loads(text_data)
            serializer = NotificationSerializer(data)
            if serializer.is_valid():
                serialized_data = serializer.data
            else:
                print("Invalid notification data received")
                return
            #notification_type = data.get("notification_type")  # Type of notification
            #message = data.get("content")
            #sender = data.get("sender")

            #if not notification_type or not message or not sender:
            #    print("Error: Notification recieved is not valid")
            #    return  # Ignore invalid data

            # Send notification to the group (all users in the group receive it)
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "send_notification",
                    "data": serialized_data
                },
            )
        except json.JSONDecodeError:
            print("Invalid JSON received")

    async def send_notification(self, event):
        #notification_type = event["notification_type"]
        #message = event["message"]
        #sender = event["sender"]
        data = event["data"]

        # Send the notification to the WebSocket
        await self.send(text_data=json.dumps({
            "data": data
        }))