from rest_framework import serializers
from .models import Message
from django.contrib.contenttypes.models import ContentType

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    receiver_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = "__all__"

    def get_sender_name(self, obj):
        return str(obj.sender)

    def get_receiver_name(self, obj):
        return str(obj.receiver)
