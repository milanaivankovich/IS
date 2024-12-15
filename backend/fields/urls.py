from django.urls import path 
from . import views

urlpatterns = [
    #Field Endpoints
    path('api/fields/', views.getData), #GET all fields
    path('api/sports/', views.getSports), #GET all sports
    path('api/field/', views.setData), #POST to create new field
    path('api/field/<str:location>/', views.fields_by_location), #GET fields by location
    path('api/sport/<int:sport_id>/', views.get_sport_name), #GET sport name by sport id
    path('api/sport/<str:sport_name>/', views.get_sport_id), #GET sport id by sport name
    path('api/field/<int:field_id>/sports/', views.field_sports, name='field_sports'), #GET sports by field id
    path('api/field/id/<int:id>/', views.field_by_id), #GET field by id
]