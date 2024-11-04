# accounts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Set up the router for viewsets
router = DefaultRouter()
router.register(r'standard_users', views.StandardUserViewSet)
router.register(r'business_subjects', views.BusinessSubjectViewSet)
router.register(r'clients', views.ClientViewSet)

# Add custom registration path
urlpatterns = [
    path('register/', views.UserRegistrationView.as_view(), name='user-registration'),
    path('', include(router.urls)),
]
