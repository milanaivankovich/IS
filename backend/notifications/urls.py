from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import NotificationViewSet, NotificationList
from .views import count_unread_notifications, mark_all_notifications_as_read, mark_notification_as_read, delete_notification
from activities.views import ActivitiesCreateView
#from .views import send_push_notification, webpush_subscribe

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet)
#router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    #path('api/notifications', views.get_all_notifications, name='api_notifications'),
    #path('api/notifications/<int:id>', views.get_notifications_by_client_id, name='get_notifications_by_client_id'),
    path('api/notifications/pagination/<int:id>', views.NotificationList.as_view(), name = 'get_notifications_by_client_pagination'),
    path('api/notifications/unread-count/<int:reciever_id>', count_unread_notifications),
    path('api/notifications/mark-read/<int:item_id>/', mark_notification_as_read),
    path('api/notifications/mark-all-read/<int:reciever_id>/', mark_all_notifications_as_read),
    path('api/notifications/delete/<int:item_id>/', delete_notification),
    path('api/notifications/webpush/subscribe/<str:username>/', views.subscribe_to_webpush_service, name='subscribe_webpush'),
    #path("webpush/subscribe/<str:username>/", webpush_subscribe, name="webpush_subscribe"),
    #path('api/webpush/notify/<str:username>/', send_push_notification, name="webpush_notify"),
]