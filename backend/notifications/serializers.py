from rest_framework import serializers
from activities.models import Activities, Comment
from accounts.serializers import ClientSerializer
from activities.serializers import ActivitiesSerializer, CommentSerializer
from .models import NotificationGeneric, Notification
from django.contrib.auth.models import User

class NotificationSerializer(serializers.ModelSerializer):
    recipient = ClientSerializer(read_only=True)
    sender = ClientSerializer(read_only=True)
    post = ActivitiesSerializer(read_only=True)
    comment = CommentSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'sender', 'post', 'comment', 'notification_type', 'content', 'is_read', 'created_at']

from advertisements.serializers import AdvertisementSerializer
from accounts.serializers import BusinessSubjectSerializer

class NotificationGenericSerializer(serializers.ModelSerializer):
    recipient_client = ClientSerializer(read_only=True)
    recipient_subject = BusinessSubjectSerializer(read_only=True)
    sender_client = ClientSerializer(read_only=True)
    sender_subject = BusinessSubjectSerializer(read_only=True)
    activity = ActivitiesSerializer(read_only=True)
    advertisement = AdvertisementSerializer(read_only=True)
    comment = CommentSerializer(read_only=True)

    class Meta:
        model = NotificationGeneric
        fields = ['id', 'sender_client', 'sender_subject', 'activity', 'advertisement' , 'comment', 'notification_type', 'content', 'is_read', 'created_at', 'recipient_client', 'recipient_subject']