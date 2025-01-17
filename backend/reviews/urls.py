from django.urls import path
from . import views

urlpatterns = [
    #Review Endpoints
    path('api/reviews/', views.getData), #GET all reviews
    path('api/review/', views.setData), #POST to create new review
    path('api/reviews/<int:field>/', views.reviews_by_field), #GET reviews by field
    path('api/review/update/<int:review_id>/', views.update_liked_by, name='update_liked_by'), #Update liked_by field
    path('api/review/delete/<int:review_id>/', views.remove_from_liked_by, name='delete_liked_by'), #Remove from liked_by field
]