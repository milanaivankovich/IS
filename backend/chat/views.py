from django.shortcuts import render

from rest_framework import generics
from .models import Message
from .serializers import MessageSerializer
from django.contrib.contenttypes.models import ContentType
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from rest_framework.response import Response
from rest_framework.decorators import api_view

class MessageListCreate(generics.ListCreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def get_queryset(self):
        room_name = self.request.query_params.get("room_name")
        if room_name:
            return Message.objects.filter(room_name=room_name).order_by("timestamp")
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

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_message(request):
    sender = request.user
    receiver_id = request.data.get("receiver_id")
    content = request.data.get("content")

    # Ensure the receiver exists (either Client or BusinessSubject)
    receiver = None
    if Client.objects.filter(id=receiver_id).exists():
        receiver = Client.objects.get(id=receiver_id)
    elif BusinessSubject.objects.filter(id=receiver_id).exists():
        receiver = BusinessSubject.objects.get(id=receiver_id)
    else:
        return Response({"error": "Invalid receiver"}, status=400)

    # Save the message
    message = Message.objects.create(sender=sender, receiver=receiver, content=content)
    
    return Response({"message": "Message sent successfully!"})    


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_messages_between_users(request):
    sender_id = request.query_params.get("sender_id")
    sender_type = request.query_params.get("sender_type")  # "client" or "businesssubject"
    receiver_id = request.query_params.get("receiver_id")
    receiver_type = request.query_params.get("receiver_type")  # "client" or "businesssubject"

    if not sender_id or not sender_type or not receiver_id or not receiver_type:
        return Response({"error": "Missing required parameters"}, status=400)

    sender_content_type = ContentType.objects.get(model=sender_type)
    receiver_content_type = ContentType.objects.get(model=receiver_type)

    messages = Message.objects.filter(
        sender_content_type=sender_content_type,
        sender_object_id=sender_id,
        receiver_content_type=receiver_content_type,
        receiver_object_id=receiver_id
    ) | Message.objects.filter(
        sender_content_type=receiver_content_type,
        sender_object_id=receiver_id,
        receiver_content_type=sender_content_type,
        receiver_object_id=sender_id
    ).order_by("timestamp")

    return Response(MessageSerializer(messages, many=True).data)    
