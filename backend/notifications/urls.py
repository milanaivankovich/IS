from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import NotificationViewSet, NotificationList
from .views import count_unread_notifications_client, count_unread_notifications_subject, mark_all_notifications_as_read_client, mark_all_notifications_as_read_subject, mark_notification_as_read, delete_notification
from activities.views import ActivitiesCreateView
#from .views import send_push_notification, webpush_subscribe

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet)
#router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    #path('api/notifications', views.get_all_notifications, name='api_notifications'),
    #path('api/notifications/<int:id>', views.get_notifications_by_client_id, name='get_notifications_by_client_id'),
    path('api/notifications/pagination/<int:id>', views.NotificationList.as_view(), name = 'get_notifications_pagination'),
    path('api/notifications/pagination/Client/<int:id>', views.NotificationClientGenericList.as_view(), name = 'get_notifications_by_client_pagination'),
    path('api/notifications/pagination/BusinessSubject/<int:id>', views.NotificationSubjectGenericList.as_view(), name = 'get_notifications_by_subject_pagination'),
    path('api/notifications/unread-count/Client/<int:reciever_id>', count_unread_notifications_client),
    path('api/notifications/unread-count/BusinessSubject/<int:reciever_id>', count_unread_notifications_subject),
    path('api/notifications/mark-read/<int:item_id>/', mark_notification_as_read),
    path('api/notifications/mark-all-read/Client/<int:reciever_id>/', mark_all_notifications_as_read_client, name='mark_all_notifications_as_read_client'),
    path('api/notifications/mark-all-read/BusinessSubject/<int:reciever_id>/', mark_all_notifications_as_read_subject, name='mark_all_notifications_as_read_subject'),
    path('api/notifications/delete/<int:item_id>/', delete_notification),
    path('api/notifications/webpush/subscribe/Client/<int:id>/', views.subscribe_to_webpush_service, name='subscribe_webpush_client'),
    path('api/notifications/webpush/subscribe/BusinessSubject/<int:id>/', views.subscribe_to_webpush_service_business_subject, name='subscribe_webpush_business_subject'),

    #path("webpush/subscribe/<str:username>/", webpush_subscribe, name="webpush_subscribe"),
    #path('api/webpush/notify/<str:username>/', send_push_notification, name="webpush_notify"),
]