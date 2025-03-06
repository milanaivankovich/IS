from rest_framework import serializers
from .models import Message
from accounts.serializers import ClientSerializer, BusinessSubjectSerializer
from accounts.models import Client, BusinessSubject


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    receiver_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = "__all__"

    def get_sender_name(self, obj):
        sender = obj.sender  # Generic ForeignKey object

        if isinstance(sender, Client):
            return ClientSerializer(sender).data.get("username", "Unknown Sender")
        elif isinstance(sender, BusinessSubject):
            return BusinessSubjectSerializer(sender).data.get("nameSportOrganization", "Unknown Sender")

        return "Unknown Sender"

    def get_receiver_name(self, obj):
        receiver = obj.receiver  # Generic ForeignKey object

        if isinstance(receiver, Client):
            return ClientSerializer(receiver).data.get("username", "Unknown Receiver")
        elif isinstance(receiver, BusinessSubject):
            return BusinessSubjectSerializer(receiver).data.get("nameSportOrganization", "Unknown Receiver")

        return "Unknown Receiver"
