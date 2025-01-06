from django.urls import path, re_path
from . import views
from .views import get_location_by_field_id, get_business_subject_by_id, get_sports_by_field_id, get_advertisements_by_business_subject, update_advertisement, delete_advertisement, get_past_advertisements_by_business_subject

urlpatterns = [
    #Advertisement Endpoints
    path('api/advertisements/', views.getData), #GET all advertisements
    path('api/advertisement/', views.setData), #POST to create new advertisement
    path('api/advertisement/<int:id>/', views.get_advertisement_by_id), #GET advertisement by id
    re_path(r'^api/advertisement/(?P<date>\d{4}-\d{2}-\d{2})/$', views.advertisements_by_date), #GET advertisements by date
    re_path(r'^api/advertisement/(?P<date>\d{4}-\d{2}-\d{2})/location/(?P<location>[\w\s\-]+)/$', views.advertisements_by_date_and_location),
    re_path(r'^api/advertisement/location/(?P<location>[\w\s\-]+)/$', views.advertisements_by_location), #GET advertisements by location
    path('api/advertisement/field/<int:field_id>/', get_location_by_field_id, name='get_location_by_field_id'), #GET location by field id
    path('api/advertisement/businesssubject/<int:business_subject_id>/', get_business_subject_by_id, name='get_business_subject_by_id'), #GET business subject by id
    path('api/advertisement/sports/<int:field_id>/', get_sports_by_field_id, name='get_sports_by_field_id'), #GET type_of_sports by field id
    path('api/advertisements/businesssubject/<str:business_name>/', get_advertisements_by_business_subject, name='get_advertisements_by_business_subject'), #GET advertisements by business subject id
    path('api/advertisements/field/<int:field>/', views.advertisements_by_field, name='advertisements_by_field'), #GET advertisements by field
    path('api/advertisement/update/<int:pk>/', views.update_advertisement, name='update_advertisement'),
    path('api/advertisement/delete/<int:pk>/', views.delete_advertisement, name='delete_advertisement'),
    path('api/advertisementspast/businesssubject/<int:business_subject_id>/', get_past_advertisements_by_business_subject, name='get_advertisements_by_business_subject'), #GET advertisements by business subject id
] 