from django.urls import path
from . import views

urlpatterns = [ 
    path('api/comments/', views.getData), #GET all comments
    path('api/comment/', views.setData), #POST to create new comment
    path('api/comments/<int:activity>/', views.comments_by_activity), #GET comments by activity
]