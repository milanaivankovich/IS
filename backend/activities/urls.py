from django.urls import path
from . import views

urlpatterns = [
    #path('dodaj/', AktivnostCreateView.as_view(), name='dodaj-aktivnost'),
    path('clients/<int:client_id>/activities/', views.get_client_activities, name='get_client_activities'),
    path('clients/<int:client_id>/activities/add/', views.add_activity, name='add_activity'),
]