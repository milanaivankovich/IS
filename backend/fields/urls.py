from django.urls import path # type: ignore
from . import views

urlpatterns = [
    #Field Endpoints
    path('api/field/', views.setData), #POST to create new field
]