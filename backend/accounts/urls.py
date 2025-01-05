# accounts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import get_business_subject_favorite_fields, update_client_favorite_fields, update_business_subject_favorite_fields

# Set up the router for viewsets
router = DefaultRouter()
#router.register(r'standard_users', views.StandardUserViewSet)
router.register(r'business_subjects', views.BusinessSubjectViewSet)
router.register(r'clients', views.ClientViewSet)

# Add custom registration path
#urlpatterns = [
   ## path('register/', views.UserRegistrationView.as_view(), name='user-registration'),
    ##path('', include(pyrouter.urls)),
#]


urlpatterns = [
    # Client Endpoints
    path('api/client/', views.register_client, name='register_client'),  # POST to create new client
    path('api/client/<int:pk>/', views.get_client, name='get_client'),  # GET client by ID
    path('api/client/<int:pk>/edit/', views.edit_client, name='edit_client'),  # PUT/PATCH to edit client
    path('api/clients/', views.list_clients, name='list_clients'), #pregled registrovanih rekreativaca

    

     
    path("api/get-client-id/", views.get_user_pk_by_token, name="get_user_pk_by_token"),

    path('api/client/<str:username>/', views.get_client_by_username, name='get_client_by_username'),

    # Business Subject Endpoints
    path('api/business-subject/', views.register_business_subject, name='register_business_subject'),  # POST to create new
    path('api/business-subject/<int:pk>/', views.get_business_subject, name='get_business_subject'),  # GET by ID
    path('api/business-subject/<int:pk>/edit/', views.edit_business_subject, name='edit_business_subject'),  # PUT/PATCH

    path('api/business-subject/<str:business_name>/', views.get_business_by_name, name='get_business_by_name'),


    path('api/login/client/', views.login_user, name='login_user'),
    path('api/login/business-subject/', views.login_business_subject, name='login_business_subject'),
    path('api/logout/', views.logout_user, name='logout_user'),

     path('oauth2callback/', views.oauth2callback, name='oauth2callback'),

    # View profile endpoint for logged-in user
    path('api/profile/', views.get_profile, name='get_profile'),  # GET the profile of the logged-in user

    path('api/search/users/', views.search_users, name='search_users'),

    path('api/activate-client/', views.activate_client, name='activate_client'),
    path('api/deactivate-client/', views.deactivate_client, name='deactivate_client'),

    path('api/activate-business-subject/', views.activate_business_subject, name='activate_business_subject'),
    path('api/deactivate-business-subject/', views.deactivate_business_subject, name='deactivate_business_subject'),

    path('api/request-password-reset/', views.request_password_reset, name='request_password_reset'),
    path('api/reset-password/<str:uidb64>/<str:token>/', views.reset_password, name='reset_password'),

    path('api/get-user-type-and-id/', views.get_user_type_and_id, name='get-user-type-and-id'),

    path('api/social-login/', views.social_login, name='social_login'),
   
    path('api/client/favorite-fields/<int:user_id>/', views.get_client_favorite_fields, name='client-favorite-fields'),
    path('api/business-subject/favorite-fields/<int:business_id>/', get_business_subject_favorite_fields, name='business-subject-favorite-fields'),
    path('api/client/update-favorite-fields/<int:user_id>/', update_client_favorite_fields, name='update-client-favorite-fields'),
    path('api/business-subject/update-favorite-fields/<int:business_id>/', update_business_subject_favorite_fields, name='update-business-subject-favorite-fields'),

    # Include the router URLs
    path('', include(router.urls)),
]
