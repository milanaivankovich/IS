from django.urls import path, re_path
from . import views

urlpatterns = [
    #path('dodaj/', AktivnostCreateView.as_view(), name='dodaj-aktivnost'),
    path('clients/<int:client_id>/activities/', views.get_client_activities, name='get_client_activities'),
    path('clients/<int:client_id>/activities/add/', views.add_activity, name='add_activity'),
    path('api/aktivnosti/', views.get_all_activities, name='get_all_activities'),


    #Filtriranje aktivnosti
    re_path(r'^activities/date/(?P<datum>\d{4}-\d{2}-\d{2})/$', views.activities_by_date, name='activities_by_date'),
    re_path(r'^activities/location/(?P<teren>[\w\s\-]+)/$', views.activities_by_location, name='activities_by_location'),
    re_path(r'^activities/date/(?P<datum>\d{4}-\d{2}-\d{2})/location/(?P<teren>[\w\s\-]+)/$', views.activities_by_date_and_location, name='activities_by_date_and_location'),
]