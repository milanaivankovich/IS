from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from accounts.models import Client,  BusinessSubject
from activities.models import Activities, Comment
from .models import Notification, NotificationGeneric
from activities.serializers import ActivitiesSerializer, CommentSerializer
from .serializers import NotificationSerializer, NotificationGenericSerializer
from django.shortcuts import get_object_or_404
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils import is_action_authorized
from .pagination import MyCursorPagination

class NotificationGenericViewSet(viewsets.ModelViewSet):
    queryset = NotificationGeneric.objects.all().order_by('-created_at')
    serializer_class = NotificationGenericSerializer
    pagination_class = MyCursorPagination

    def get_queryset(self):
        """Filter notifications to show only those for the logged-in user."""
        return self.queryset
    
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
    obj = get_object_or_404(NotificationGeneric, id=item_id)
    obj.is_deleted = True
    obj.save()
    return Response({"message": "Updated successfully"})

@api_view(['PUT'])
def mark_notification_as_read(request, item_id):
    obj = get_object_or_404(NotificationGeneric, id=item_id)
    obj.is_read = True
    obj.save()
    return Response({"message": "Updated successfully"})

@api_view(['PUT'])
def mark_all_notifications_as_read_subject(request, reciever_id):
    client = get_object_or_404(BusinessSubject, id=reciever_id)

    response = is_action_authorized_subject(request, client)
    if response.status_code != status.HTTP_200_OK:
        return response
    
    updated_count = NotificationGeneric.objects.filter(recipient_subject=client, is_read=False).update(is_read=True)
    return Response({"message": f"{updated_count} records updated successfully",
        "client_id": reciever_id})

@api_view(['PUT'])
def mark_all_notifications_as_read_client(request, reciever_id):
    client = get_object_or_404(Client, id=reciever_id)

    response = is_action_authorized(request, client)
    if response.status_code != status.HTTP_200_OK:
        return response
    
    updated_count = NotificationGeneric.objects.filter(recipient_client=client, is_read=False).update(is_read=True)
    return Response({"message": f"{updated_count} records updated successfully",
        "client_id": reciever_id})

@api_view(['GET'])
def count_unread_notifications_client(request, reciever_id):
    client = get_object_or_404(Client, id=reciever_id)
    count = NotificationGeneric.objects.filter(recipient_client=client, is_read=False, is_deleted=False).count()
    return Response({
        "unread_count": count
    }); 

@api_view(['GET'])
def count_unread_notifications_subject(request, reciever_id):
    client = get_object_or_404(BusinessSubject, id=reciever_id)
    count = NotificationGeneric.objects.filter(recipient_subject=client, is_read=False, is_deleted=False).count()
    return Response({
        "unread_count": count
    }); 
    
    
class NotificationClientGenericList(ListAPIView): 
    queryset = NotificationGeneric.objects.all()
    serializer_class = NotificationGenericSerializer
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

from .utils import is_action_authorized_subject
class NotificationSubjectGenericList(ListAPIView): 
    queryset = NotificationGeneric.objects.all()
    serializer_class = NotificationGenericSerializer
    pagination_class = MyCursorPagination

    def get(self, request, *args, **kwargs):
        try:
            client_id = int(self.kwargs.get("id"))
        except ValueError:
            return Response({'error':'Invalid client ID'}, status=400)
        client = get_object_or_404(BusinessSubject, id=client_id)
        #autorizacija
        response = is_action_authorized_subject(request, client)
        if response.status_code != status.HTTP_200_OK:
            return response

        queryset = self.get_queryset()
        paginator = MyCursorPagination()  # Use custom pagination here
        result_page = paginator.paginate_queryset(queryset, request)

        # Serialize paginated data
        serializer = NotificationGenericSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def get_queryset(self):
        try:
            client_id = int(self.kwargs.get("id"))
        except ValueError:
            return Response({'error':'Invalid client ID'}, status=400)
        
        client = get_object_or_404(BusinessSubject, id=client_id)

        return NotificationGeneric.objects.filter(
            recipient_subject=client,
            is_deleted=False,
        ).order_by('-created_at')
    
    

class NotificationClientGenericList(ListAPIView): 
    queryset = NotificationGeneric.objects.all()
    serializer_class = NotificationGenericSerializer
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
        serializer = NotificationGenericSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def get_queryset(self):
        try:
            client_id = int(self.kwargs.get("id"))
        except ValueError:
            return Response({'error':'Invalid client ID'}, status=400)
        
        client = get_object_or_404(Client, id=client_id)

        return NotificationGeneric.objects.filter(
            recipient_client=client,
            is_deleted=False,
        ).order_by('-created_at')



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

from .webpush import subscribe_webpush, official_send_push_notification, subscribe_webpush_business_subject, unsubscribe_webpush, unsubscribe_webpush_bussinesSubject
@csrf_exempt
def subscribe_to_webpush_service(request, id):
    user = get_object_or_404(Client, id=id)
    return subscribe_webpush(request, user)

@csrf_exempt
def subscribe_to_webpush_service_business_subject(request, id):
    user = get_object_or_404(BusinessSubject, id=id)
    return subscribe_webpush_business_subject(request, user)

@csrf_exempt
def unsubscribe_webpush_service_business_subject(request, id):
    user = get_object_or_404(BusinessSubject, id=id)
    
    ##response = is_action_authorized_subject(request, user)
    ##if response.status_code != status.HTTP_200_OK:
    ##    return response
    ##return unsubscribe_webpush_bussinesSubject(request, user)

@csrf_exempt
def unsubscribe_webpush_service_client(request, id):
    user = get_object_or_404(Client, id=id)
    
    ##response = is_action_authorized(request, user)
    ##if response.status_code != status.HTTP_200_OK:
    ##    return JsonResponse(response.data, safe=False, status = response.status_code)
    return unsubscribe_webpush(request, user)
    

from .serializers import PreferencesSerializer
#preferences
from rest_framework.views import APIView
from notifications.models import Preferences
class PreferencesAPIView(APIView):
    queryset = Preferences.objects.all()
    serializer_class = PreferencesSerializer

    def get(self, request, type, id):
        """Handles GET request
        try:
            client_id = int(self.kwargs.get("id"))
            type = int(self.kwargs.get("type"))
        except ValueError:
            return Response({'error':'Invalid client ID or type'}, status=400)
        """
        if type.lower()=="client":
            client = get_object_or_404(Client, id=id)
        #autorizacija
            response = is_action_authorized(request, client)
            if response.status_code != status.HTTP_200_OK:
                return response
            
            preference, is_created = Preferences.objects.get_or_create(client=client)
            
        elif type.lower()=="businesssubject":
            subject = get_object_or_404(BusinessSubject, id=id)
            response = is_action_authorized_subject(request, subject)
            if response.status_code != status.HTTP_200_OK:
                return response
            
            preference, is_created = Preferences.objects.get_or_create(subject=subject)

        serializer = self.serializer_class(preference)
        return Response(serializer.data, status.HTTP_200_OK)
    
    def put(self, request, type, id):
        '''
        try:
            client_id = int(self.kwargs.get("id"))
            type = int(self.kwargs.get("type"))
        except ValueError:
            return Response({'error':'Invalid client ID or type'}, status=400)
        '''
        if type=="Client":
            client = get_object_or_404(Client, id=id)
        #autorizacija
            response = is_action_authorized(request, client)
            if response.status_code != status.HTTP_200_OK:
                return response
            
            preference, is_created = Preferences.objects.get_or_create(client=client)
            
        elif type=="BusinessSubject":
            subject = get_object_or_404(BusinessSubject, id=id)
            response = is_action_authorized_subject(request, subject)
            if response.status_code != status.HTTP_200_OK:
                return response
            
            preference, is_created = Preferences.objects.get_or_create(subject=subject)

        email = request.data.get("email_notifications")
        group = request.data.get("group_notifications")

        if email==None or group==None:
            return Response({"error": "Invalid request data"}, status=status.HTTP_400_BAD_REQUEST)
        preference.email_notifications=bool(email)
        preference.group_notifications=bool(group)
        preference.save()
        return Response({"message": "Preferences updated!"}, status=status.HTTP_200_OK)
