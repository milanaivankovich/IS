from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from accounts.models import Client
from activities.models import Activities, Comment
from .models import Notification
from activities.serializers import ActivitiesSerializer, CommentSerializer
from .serializers import NotificationSerializer

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
        recipient=id,
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

    def get_by_client_id(self):
        id = self.kwargs.get(id)
        try:
            client = Client.objects.get(id=id)
        except Client.DoesNotExist:
            return Response({'error': 'Client not found'}, status=404)
    
        notifications = Notification.objects.filter(
            recipient=id,
            is_deleted=False,
        ).order_by('-created_at')
    
        if notifications.exists():
            serializer = NotificationSerializer(notifications, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'No notifications found for this client'}, status=404)
    
#@api_view(['GET'])
#def get_all_notifications(request):
        # Custom logic, e.g., get notifications marked as special
#        notifications = Notification.objects.filter(is_deleted=False)
#        serializer = NotificationSerializer(notifications, many=True)
#        return Response(serializer.data)