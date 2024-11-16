from django.urls import path
from . import views

urlpatterns = [
    #Review Endpoints
    path('api/review/', views.setData), #POST to create new review
]