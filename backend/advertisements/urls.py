from django.urls import path, re_path
from . import views
from .views import get_location_by_field_id, get_business_subject_by_id, get_sport_by_field_id

urlpatterns = [
    #Advertisement Endpoints
    path('api/advertisements/', views.getData), #GET all advertisements
    path('api/advertisement/', views.setData), #POST to create new advertisement
    re_path(r'^api/advertisement/(?P<date>\d{4}-\d{2}-\d{2})/$', views.advertisements_by_date), #GET advertisements by date
    re_path(r'^api/advertisement/(?P<date>\d{4}-\d{2}-\d{2})/location/(?P<location>[\w\s\-]+)/$', views.advertisements_by_date_and_location),
    re_path(r'^api/advertisement/location/(?P<location>[\w\s\-]+)/$', views.advertisements_by_location), #GET advertisements by location
    path('api/advertisement/field/<int:field_id>/', get_location_by_field_id, name='get_location_by_field_id'), #GET location by field id
    path('api/advertisement/sport/<int:field_id>/', get_sport_by_field_id, name='get_location_by_field_id'), #GET sport by field id
    path('api/advertisement/businesssubject/<int:business_subject_id>/', get_business_subject_by_id, name='get_business_subject_by_id'), #GET business subject by id
]