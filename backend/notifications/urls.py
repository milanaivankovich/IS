from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ActivitiesViewSet, CommentViewSet, NotificationViewSet, UserViewSet

router = DefaultRouter()
router.register(r'activities', ActivitiesViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
]