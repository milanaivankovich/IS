from django.urls import path, re_path
from . import views

urlpatterns = [
    #Advertisement Endpoints
    path('api/advertisements/', views.getData), #GET all advertisements
    path('api/advertisement/', views.setData), #POST to create new advertisement
   re_path(r'^api/advertisement/(?P<date>\d{4}-\d{2}-\d{2})/$', views.advertisements_by_date), #GET advertisements by date
    re_path(r'^api/advertisement/location/(?P<location>[\w\s\-]+)/$', views.advertisements_by_location), #GET advertisements by location
]