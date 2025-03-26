import json 
from channels.generic.websocket import AsyncWebsocketConsumer
from .serializers import NotificationSerializer
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model
from urllib.parse import parse_qs
from accounts.models import ClientToken, BusinessSubjectToken

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
##
        query_string = parse_qs(self.scope["query_string"].decode())
        token = query_string.get("token", [None])[0]

        self.user = await self.authenticate_user(token)
        if self.user is None:
            await self.close()
            return
##

        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.group_name = f"notifications_{self.room_name}"
        print(self.room_name + self.group_name)

        # Join the chat group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

###
    async def authenticate_user(self, token):
        if not token:
            return None
        try:
            return await sync_to_async(ClientToken.objects.get)(key=token)
            #return await sync_to_async(client_token.client)()
        except ClientToken.DoesNotExist:
            pass
        '''
        try:
            bs_token = await sync_to_async(BusinessSubjectToken.objects.get)(key=token)
            return bs_token.business_subject
        except BusinessSubjectToken.DoesNotExist:
            return None'
        '''
###    

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