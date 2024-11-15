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
    # Client Endpoints
    path('api/client/', views.register_client, name='register_client'),  # POST to create new client
    path('api/client/<int:pk>/', views.get_client, name='get_client'),  # GET client by ID
    path('api/client/<int:pk>/', views.edit_client, name='edit_client'),  # PUT/PATCH to edit client

    # Business Subject Endpoints
    path('api/business-subject/', views.register_business_subject, name='register_business_subject'),  # POST to create new
    path('api/business-subject/<int:pk>/', views.get_business_subject, name='get_business_subject'),  # GET by ID
    path('api/business-subject/<int:pk>/', views.edit_business_subject, name='edit_business_subject'),  # PUT/PATCH

    
    
    # Include the router URLs
    path('', include(router.urls)),
]
