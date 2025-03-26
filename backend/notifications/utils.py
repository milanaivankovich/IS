
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

from activities.models import Activities
from .models import Notification
from .webpush import send_push_notification_to_all_user_devices

def after_post_update_or_delete(instance, is_deleted):
    """
    Sends a notification when a post is updated (not created).
    """
            #ako je post obrisan
    if is_deleted == True:
                notification_type='activity_delete'
                content=f"{instance.client.username} je uklonio događaj na koji ste prijavljeni."
            #ako nije obrisan
    else:
                notification_type='azuriranje'  # Set notification type
                content=f"{instance.client.username} ažurira događaj na koji ste prijavljeni."


    for participant in instance.participants.all():
                 #ne salje sam sebi
                new_notification = Notification.objects.create(

                        recipient=participant,  # Notify the post author
                        sender=instance.client,  # The user who liked the post
                        post=instance,
                        notification_type=notification_type,  # Set notification type
                        content=content,
                    )
                send_notification(participant.id ,new_notification)
                send_push_notification_to_all_user_devices(new_notification.recipient, f"@{new_notification.sender.username}", new_notification.content, f"@{new_notification.sender.username}/{new_notification.notification_type}")
