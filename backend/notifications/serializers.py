from rest_framework import serializers
from backend.activities.models import Activities, Comment
from backend.accounts.serializers import ClientSerializer
from backend.activities.serializers import ActivitiesSerializer, CommentSerializer
from .models import Notification
from django.contrib.auth.models import User

class NotificationSerializer(serializers.ModelSerializer):
    recipient = ClientSerializer(read_only=True)
    sender = ClientSerializer(read_only=True)
    post = ActivitiesSerializer(read_only=True)
    comment = CommentSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'sender', 'post', 'comment', 'notification_type', 'content', 'is_read', 'created_at']