from django.urls import path
from . import views
from rest_framework.routers import DefaultRouter
from .views import get_location_by_field_id, check_user_registration, register_to_activity, login_user
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    #path('dodaj/', AktivnostCreateView.as_view(), name='dodaj-aktivnost'),
    path('clients/<int:client_id>/activities/', views.get_client_activities, name='get_client_activities'),
    path('clients/<int:client_id>/activities/add/', views.add_activity, name='add_activity'),
    path('clients/<int:client_id>/client_activities/', views.client_activities, name='client_activities'),
    path('activities/create/', views.ActivitiesCreateView.as_view(), name='create_activity'), #kreiranje aktivnosti
    path('api/activities/', views.getData),# API endpointi za dohvat i unos podataka
    path('api/activities/add/', views.setData, name='add_activity_api'),
   
    path('activities/date/<str:date>/', views.activities_by_date, name='activities_by_date'),      # Filtriranje aktivnosti prema datumu, lokaciji ili kombinaciji
    path('activities/location/<str:location>/', views.activities_by_location, name='activities_by_location'),
    path('activities/date/<str:date>/location/<str:location>/', views.activities_by_date_and_location, name='activities_by_date_and_location'),

    # Lokacija prema ID-u polja
    path('fields/<int:field_id>/location/', views.get_location_by_field_id, name='get_location_by_field_id'),
    # Tip sporta prema ID-u polja
    path('fields/<int:field_id>/type_of_sport/', views.get_type_of_sport_by_field_id, name='get_type_of_sport_by_field_id'),
    # Ažuriranje aktivnosti
    path('activities/update/<int:activity_id>/', views.update_activity, name='update_activity'),
    #Obrada broja ucesnika u aktivnosti
    path('activities/<int:activity_id>/register/', views.register_to_activity, name='register_to_activity'),
    #pretraga na onsovu username
    path('activities/username/<str:username>/', views.activities_by_username, name='activities_by_username'),
   # Filtracija aktivnosti po ID-u terena
    path('activities/field/<int:field_id>/', views.activities_by_field, name='activities_by_field'),
    path('activities/<int:activity_id>/check-registration/<str:username>/', check_user_registration, name='check_user_registration'),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    path('login/', login_user, name='login'),
    path('activities/<int:activity_id>/register/', register_to_activity, name='register_to_activity'),
]