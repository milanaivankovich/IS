from django.urls import path
from . import views
from rest_framework.routers import DefaultRouter
from .views import get_location_by_field_id, get_registered_events

urlpatterns = [
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
    path('api/registered-events/', views.get_registered_events, name='registered-events'),
    path('api/events/history/<str:username>/', views.get_event_history, name='event-history'),
    path('profile/', views.user_profile, name='user_profile'),
    path('api/user-events/<str:username>/', views.get_user_events, name='user-events'),
    path('api/registered-events/<str:username>/', views.get_registered_events, name='registered-events'),
    path('activities/<int:activity_id>/unregister/', views.unregister_activity, name='unregister_activity'),
    path('activities/delete/<int:pk>/', views.delete_activity, name='delete_activity'),
]