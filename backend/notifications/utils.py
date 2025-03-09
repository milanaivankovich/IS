
from channels.layers import get_channel_layer

def send_notification(notification):
    # Get the channel layer
        channel_layer = get_channel_layer()

    # Create the message you want to broadcast
        message = notification.content  # or whatever field contains the notification text

    # Send the message to the 'notifications' group
        channel_layer.group_send(
            'notification',  # Group name to broadcast to
            {
                'type': 'send_notification',  # Consumer method to call
                'message': message  # The message content
            }
        )