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
#urlpatterns = [
   ## path('register/', views.UserRegistrationView.as_view(), name='user-registration'),
    ##path('', include(router.urls)),
#]



urlpatterns = [
    path('api/register/standard_user/', views.register_standard_user, name='register_standard_user'),
    path('api/register/business_subject/', views.register_business_subject, name='register_business_subject'),
    path('api/register/client/', views.register_client, name='register_client'),
]
