from django.urls import path   
from . import views

urlpatterns = [
    #Advertisement Endpoints
    path('api/advertisements/', views.getData), #GET all advertisements
    path('api/advertisement/', views.setData), #POST to create new advertisement
]