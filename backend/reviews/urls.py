from django.urls import path
from . import views

urlpatterns = [
    path('reviews/', views.getData),
    path('reviews/add/', views.setData),
]