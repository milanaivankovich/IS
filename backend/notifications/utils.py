
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .serializers import NotificationGenericSerializer

#room name je Client<int:ID> ili BusinessSubject<int:ID> u zavisnosti ko je primalac
'''
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
'''

def send_notification_generic(room_name, notification):
    """Broadcast a notification to the correct room."""
    channel_layer = get_channel_layer()
    
    serializer = NotificationGenericSerializer(notification)
    serialized_data = serializer.data 

    async_to_sync(channel_layer.group_send)(
        f"notifications_{room_name}",
        {
            'type': 'send_notification', 
            'data': serialized_data
        }
    )

from activities.models import Activities
from .models import NotificationGeneric
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
                new_notification = NotificationGeneric.objects.create(

                        recipient_client=participant,  # Notify the post author
                        sender_client=instance.client,  # The user who liked the post
                        activity=instance,
                        notification_type=notification_type,  # Set notification type
                        content=content,
                    )
                send_notification_generic(f"Client{participant.id}" ,new_notification)
                #send_push_notification_to_all_user_devices(new_notification.recipient_client, f"@{new_notification.sender_client.username}", new_notification.content, f"@{new_notification.sender_client.username}/{new_notification.notification_type}")


from rest_framework import status
from rest_framework.response import Response

from accounts.models import ClientToken
def is_action_authorized(request, request_user):
        
    token = request.headers.get('Authorization')  # Expected format: "Token <your_token>"
    
    if not token:
        return Response({"error": "Authentication token required"}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        # Extract the actual token key from the "Token <token>" format
        token_key = token.split(' ')[1]  # Assumes "Token <token>"
        
        # Retrieve the token object from the database
        client_token = ClientToken.objects.get(key=token_key)
        
        # Retrieve the client associated with this token
        user = client_token.client  # Assuming a reverse relationship 'client' exists
        if (user.id != request_user.id):
            return Response({"Token and user id are not matching"}, status=status.HTTP_403_FORBIDDEN)
        return Response({"pk": user.pk}, status=status.HTTP_200_OK)

    except IndexError:
        return Response({"error": "Invalid token format"}, status=status.HTTP_400_BAD_REQUEST)
    except ClientToken.DoesNotExist:
        return Response({"error": "Invalid token or token expired"}, status=status.HTTP_401_UNAUTHORIZED)  
    
from accounts.models import BusinessSubject, BusinessSubjectToken
def is_action_authorized_subject(request, request_user):
        
    token = request.headers.get('Authorization')  # Expected format: "Token <your_token>"
    
    if not token:
        return Response({"error": "Authentication token required"}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        # Extract the actual token key from the "Token <token>" format
        token_key = token.split(' ')[1]  # Assumes "Token <token>"
        
        # Retrieve the token object from the database
        client_token = BusinessSubjectToken.objects.get(key=token_key)
        
        # Retrieve the client associated with this token
        user = client_token.client  # Assuming a reverse relationship 'client' exists
        if (user.id != request_user.id):
            return Response({"Token and user id are not matching"}, status=status.HTTP_403_FORBIDDEN)
        return Response({"pk": user.pk}, status=status.HTTP_200_OK)

    except IndexError:
        return Response({"error": "Invalid token format"}, status=status.HTTP_400_BAD_REQUEST)
    except ClientToken.DoesNotExist:
        return Response({"error": "Invalid token or token expired"}, status=status.HTTP_401_UNAUTHORIZED)  
    
