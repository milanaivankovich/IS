from django.urls import path   
from . import views

urlpatterns = [
    #Advertisement Endpoints
    path('api/advertisement/', views.setData), #POST to create new advertisement
]