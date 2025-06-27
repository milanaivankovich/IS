from django.urls import path
from .views import MessageListCreate, create_message, send_message, get_messages_between_users, conversations_list

urlpatterns = [
    path("api/messages/", MessageListCreate.as_view(), name="message-list"),
    path("api/messages/create/", create_message, name="create-message"),
    path("api/messages/send/", send_message, name="send-message"), 
    path('api/conversations/', conversations_list, name='conversations-list'),
    path("api/messages/conversation/", get_messages_between_users, name="conversation-history"),

]
