
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .serializers import NotificationSerializer

def send_notification(room_name, notification):
    """Broadcast a notification to the correct room."""
    channel_layer = get_channel_layer()
    
    serializer = NotificationSerializer(notification)
    serialized_data = serializer.data 

    async_to_sync(channel_layer.group_send)(
        f"notifications_{room_name}",
        {
            'type': 'send_notification', 
            'data': serialized_data
        }
    )
    print("notification is sent: "+ f"notifications_{room_name}")