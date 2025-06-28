from django.shortcuts import render

from rest_framework import generics
from .models import Message
from .serializers import MessageSerializer
from django.contrib.contenttypes.models import ContentType
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from accounts.models import ClientToken, BusinessSubjectToken
from accounts.serializers import ClientSerializer, BusinessSubjectSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q, Max
from accounts.models import Client, BusinessSubject
from django.contrib.auth import get_user_model


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
def conversations_list(request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Token "):
        return Response({"detail": "Authentication credentials were not provided."}, status=403)

    token = auth_header.split(" ")[1]

    user = None
    try:
        user = ClientToken.objects.select_related("client").get(key=token).client
    except ClientToken.DoesNotExist:
        try:
            user = BusinessSubjectToken.objects.select_related("business_subject").get(key=token).business_subject
        except BusinessSubjectToken.DoesNotExist:
            pass

    if user is None:
        return Response({"detail": "Invalid token."}, status=403)

    # Dohvatanje ContentType za prepoznavanje modela
    user_ct = ContentType.objects.get_for_model(user)
    client_ct = ContentType.objects.get_for_model(Client)
    bs_ct = ContentType.objects.get_for_model(BusinessSubject)

    # Poruke u kojima je korisnik pošiljalac ili primalac
    messages = Message.objects.filter(
        Q(sender_content_type=user_ct, sender_object_id=user.id) |
        Q(receiver_content_type=user_ct, receiver_object_id=user.id),
        is_deleted=False,
    )

    conversations = {}

    for msg in messages.order_by("-timestamp"):
        # Ko je drugi korisnik u konverzaciji?
        if msg.sender_content_type == user_ct and msg.sender_object_id == user.id:
            other_ct = msg.receiver_content_type
            other_id = msg.receiver_object_id
        else:
            other_ct = msg.sender_content_type
            other_id = msg.sender_object_id

        key = f"{other_ct.id}_{other_id}"
        if key not in conversations:
            try:
                model = other_ct.model_class()
                other_instance = model.objects.get(id=other_id)
            except Exception as e:
                print(f"❌ Greška: {e}")
                continue

            # Precizno odredi tip korisnika
            if other_ct.model_class() == Client:
                name = f"{getattr(other_instance, 'first_name', '')} {getattr(other_instance, 'last_name', '')}".strip()
                name = name if name else getattr(other_instance, "username", "Nepoznat korisnik")
                other_user_data = {
                    "id": other_instance.id,
                    "type": "client",
                    "username": getattr(other_instance, "username", None),
                    "name": name,
                    "avatar": request.build_absolute_uri(other_instance.profile_picture.url) if other_instance.profile_picture else None,
                }

            elif other_ct.model_class() == BusinessSubject:
                other_user_data = {
                    "id": other_instance.id,
                    "type": "businesssubject",
                    "name": getattr(other_instance, "name", None) or getattr(other_instance, "nameSportOrganization", None),
                    "avatar": request.build_absolute_uri(other_instance.profile_picture.url) if other_instance.profile_picture else None,
                }

            else:  # fallback na običnog User-a
                name = f"{getattr(other_instance, 'first_name', '')} {getattr(other_instance, 'last_name', '')}".strip()
                other_user_data = {
                    "id": other_instance.id,
                    "type": "user",
                    "username": getattr(other_instance, "username", None),
                    "name": name if name else getattr(other_instance, "username", "Nepoznat korisnik"),
                    "avatar": request.build_absolute_uri(other_instance.profile_picture.url) if hasattr(other_instance, "profile_picture") and other_instance.profile_picture else None,
                }

            conversations[key] = {
                "other_user": other_user_data,
                "last_message": msg.content,
                "last_timestamp": msg.timestamp.isoformat(),
                "unread": messages.filter(
                    sender_content_type=other_ct,
                    sender_object_id=other_id,
                    receiver_content_type=user_ct,
                    receiver_object_id=user.id,
                    is_read=False,
                    is_deleted=False,
                ).count(),
            }

    sorted_conversations = sorted(conversations.values(), key=lambda x: x["last_timestamp"], reverse=True)
    return Response(sorted_conversations)




@api_view(["GET"])
@permission_classes([AllowAny])  # Ako ne koristiš Django login sistem
def get_current_user_from_token(request):
    token = request.headers.get("Authorization")

    if not token:
        return Response({"error": "Token is missing"}, status=400)

    # Strip "Token " prefix if present
    if token.startswith("Token "):
        token = token[6:]

    # Try to find the user by token
    try:
        client_token = ClientToken.objects.get(key=token)
        client = client_token.client
        return Response({
            "id": client.id,
            "username": client.username,
            "email": client.email,
            "type": "client",
            # Add more fields if needed
        })
    except ClientToken.DoesNotExist:
        pass

    try:
        bs_token = BusinessSubjectToken.objects.get(key=token)
        bs = bs_token.business_subject
        return Response({
            "id": bs.id,
            "name": bs.nameSportOrganization,
            "email": bs.email,
            "type": "businesssubject",
            # Add more fields if needed
        })
    except BusinessSubjectToken.DoesNotExist:
        return Response({"error": "Invalid token"}, status=401)


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
