from django.urls import path   
from . import views

urlpatterns = [
    path('advertisements/', views.getData),
    path('advertisements/add/', views.setData),
]