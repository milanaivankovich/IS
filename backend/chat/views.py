from django.shortcuts import render

from rest_framework import generics
from .models import Message
from .serializers import MessageSerializer
from django.contrib.contenttypes.models import ContentType
from rest_framework.response import Response
from rest_framework.decorators import api_view

class MessageListCreate(generics.ListCreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return Message.objects.filter(sender_object_id=user_id) | Message.objects.filter(receiver_object_id=user_id)
        return Message.objects.all()

@api_view(["POST"])
def create_message(request):
    sender_content_type = ContentType.objects.get(model=request.data["sender_content_type"])
    receiver_content_type = ContentType.objects.get(model=request.data["receiver_content_type"])

    message = Message.objects.create(
        sender_content_type=sender_content_type,
        sender_object_id=request.data["sender_object_id"],
        receiver_content_type=receiver_content_type,
        receiver_object_id=request.data["receiver_object_id"],
        content=request.data["content"],
    )
    return Response(MessageSerializer(message).data)
