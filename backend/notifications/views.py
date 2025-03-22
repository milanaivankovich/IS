from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from accounts.models import Client
from activities.models import Activities, Comment
from .models import Notification
from activities.serializers import ActivitiesSerializer, CommentSerializer
from .serializers import NotificationSerializer
from django.shortcuts import get_object_or_404
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from django.contrib.auth.models import User

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer

    def get_queryset(self):
        """Filter notifications to show only those for the logged-in user."""
        return self.queryset.filter(recipient=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Custom action to mark all notifications as read."""
        self.get_queryset().update(is_read=True)
        return Response({"message": "All notifications marked as read"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Custom action to mark a specific notification as read."""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"message": "Notification marked as read"}, status=status.HTTP_200_OK)
    
@api_view(['GET'])
def get_notifications_by_client_id(request, id): #todo authorization
    try:
        client = Client.objects.get(id=id)
    except Client.DoesNotExist:
        return Response({'error': 'Client not found'}, status=404)
    
    notifications = Notification.objects.filter(
        recipient=client,
        is_deleted=False,
    ).order_by('-created_at')
    
    if notifications.exists():
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
    else:
        return Response({'error': 'No notifications found for this client'}, status=404)
    
from .pagination import MyCursorPagination
from rest_framework.generics import ListAPIView

class NotificationList(ListAPIView): 
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    pagination_class = MyCursorPagination

    def get_queryset(self):
        try:
            client_id = int(self.kwargs.get("id"))
        except ValueError:
            return Response({'error':'Invalid client ID'}, status=400)
        
        client = get_object_or_404(Client, id=client_id)
    
        return Notification.objects.filter(
            recipient=client,
            is_deleted=False,
        ).order_by('-created_at')
    
       # if notifications.exists():
       #     serializer = NotificationSerializer(notifications, many=True)
       #     return Response(serializer.data)
       # else:
       #     return Response({'error': 'No notifications found for this client'}, status=404)

@api_view(['PUT'])
def delete_notification(request, item_id):
    obj = get_object_or_404(Notification, id=item_id)
    obj.is_deleted = True
    obj.save()
    return Response({"message": "Updated successfully"})

@api_view(['PUT'])
def mark_notification_as_read(request, item_id):
    obj = get_object_or_404(Notification, id=item_id)
    obj.is_read = True
    obj.save()
    return Response({"message": "Updated successfully"})

@api_view(['PUT'])
def mark_all_notifications_as_read(request, reciever_id):
    client = get_object_or_404(Client, id=reciever_id)
    updated_count = Notification.objects.filter(recipient=client).update(is_read=True)
    return Response({"message": f"{updated_count} records updated successfully",
        "client_id": reciever_id})

@api_view(['GET'])
def count_unread_notifications(request, reciever_id):
    client = get_object_or_404(Client, id=reciever_id)
    count = Notification.objects.filter(recipient=client, is_read=False, is_deleted=False).count()
    return Response({
        "unread_count": count
    }); 
    
    """
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
        return Response({"pk": user.pk}, status=status.HTTP_200_OK)

    except IndexError:
        return Response({"error": "Invalid token format"}, status=status.HTTP_400_BAD_REQUEST)
    except ClientToken.DoesNotExist:
        return Response({"error": "Invalid token or token expired"}, status=status.HTTP_401_UNAUTHORIZED)  
    """
    
#@api_view(['GET'])
#def get_all_notifications(request):
        # Custom logic, e.g., get notifications marked as special
#        notifications = Notification.objects.filter(is_deleted=False)
#        serializer = NotificationSerializer(notifications, many=True)
#        return Response(serializer.data)

'''
### webpush
from webpush import send_user_notification
from webpush.utils import send_to_subscription

@csrf_exempt  # Temporarily disable CSRF (or handle it properly in React)  # Ensure the user is authenticated
def webpush_subscribe(request, username):
    if request.method == "POST":
        try:
            subscription = json.loads(request.body)
            user = get_object_or_404(Client, username=username)
            user.webpush_info = subscription
            user.save()
            return JsonResponse({"status": "Subscription successful"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
def send_push_notification(request, username):
    """ Send push notification to a user """
    if request.method == "POST":
        data = json.loads(request.body)
        payload = {"head": "New Notification", "body": data.get("message", "Hello!")}

        user = get_object_or_404(Client, username=username) 
        if user.webpush_info is not None: # Change to your user system
            send_to_subscription(subscription=user.webpush_info,payload=payload, ttl=1000)
            #send_user_notification(payload=payload, ttl=1000, subscription_info = user.webpush_info)
            print("Webpush notification sent")
            return JsonResponse({"message": "Notification sent!"})
        else: return JsonResponse({"error": "No subscription info"}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=400)'
    '''