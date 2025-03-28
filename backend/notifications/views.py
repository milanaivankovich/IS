from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from accounts.models import Client,  BusinessSubject
from activities.models import Activities, Comment
from .models import Notification
from activities.serializers import ActivitiesSerializer, CommentSerializer
from .serializers import NotificationSerializer
from django.shortcuts import get_object_or_404
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils import is_action_authorized

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
from rest_framework.permissions import IsAuthenticated

class NotificationList(ListAPIView): 
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    pagination_class = MyCursorPagination

    def get(self, request, *args, **kwargs):
        try:
            client_id = int(self.kwargs.get("id"))
        except ValueError:
            return Response({'error':'Invalid client ID'}, status=400)
        client = get_object_or_404(Client, id=client_id)
        #autorizacija
        response = is_action_authorized(request, client)
        if response.status_code != status.HTTP_200_OK:
            return response

        queryset = self.get_queryset()
        paginator = MyCursorPagination()  # Use custom pagination here
        result_page = paginator.paginate_queryset(queryset, request)

        # Serialize paginated data
        serializer = NotificationSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

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

    response = is_action_authorized(request, client)
    if response.status_code != status.HTTP_200_OK:
        return response
    
    updated_count = Notification.objects.filter(recipient=client, is_read=False).update(is_read=True)
    return Response({"message": f"{updated_count} records updated successfully",
        "client_id": reciever_id})

@api_view(['GET'])
def count_unread_notifications(request, reciever_id):
    client = get_object_or_404(Client, id=reciever_id)
    count = Notification.objects.filter(recipient=client, is_read=False, is_deleted=False).count()
    return Response({
        "unread_count": count
    }); 
    
    
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

#jazzband push notifications
from push_notifications.models import WebPushDevice
#NE RADI
@csrf_exempt
def register_subscription(request, username):
    if request.method == 'POST':
        data = request.data
        #subscription_info = json.loads(request.body)
        #user = request.user  # Get the user from the request context
        #client = get_object_or_404(Client, username= username)
        #custom user
        #user = User.objects.create_user(username=client.username, password=client.password, email=client.email)
        # Create a new WebPushDevice for the user
        reg_id = data.registration_id
        p256dh = data.p256dh
        auth = data.auth
        browser = data.auth
        
        device = WebPushDevice.objects.create(
            registration_id=reg_id,
            p256dh=p256dh,
            auth = auth,
            browser = browser,
        )
        device.save()
        
        return JsonResponse({"status": "Subscription successful"})
    return JsonResponse({"error": "Invalid request"}, status=400)

from .webpush import subscribe_webpush, official_send_push_notification, subscribe_webpush_business_subject
@csrf_exempt
def subscribe_to_webpush_service(request, id):
    user = get_object_or_404(Client, id=id)
    return subscribe_webpush(request, user)

@csrf_exempt
def subscribe_to_webpush_service_business_subject(request, id):
    user = get_object_or_404(BusinessSubject, id=id)
    return subscribe_webpush_business_subject(request, user)
'''
@csrf_exempt
def test_sending_notification(request)
    official_send_push_notification(requ,"test","test")'
    '''