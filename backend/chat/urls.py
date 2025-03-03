from django.urls import path
from .views import MessageListCreate, create_message

urlpatterns = [
    path("api/messages/", MessageListCreate.as_view(), name="message-list"),
    path("api/messages/create/", create_message, name="create-message"),
]
