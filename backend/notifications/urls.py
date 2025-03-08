from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import NotificationViewSet
from activities.views import ActivitiesCreateView

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet)
#router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('api/notifications/<int:id>', views.get_notifications_by_client_id, name='get_notifications_by_client_id')
]