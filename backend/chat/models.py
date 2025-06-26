# backend/chat/models.py
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone

class Message(models.Model):
    sender_content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name='sent_messages')
    sender_object_id = models.PositiveIntegerField()
    sender = GenericForeignKey('sender_content_type', 'sender_object_id')

    receiver_content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name='received_messages')
    receiver_object_id = models.PositiveIntegerField()
    receiver = GenericForeignKey('receiver_content_type', 'receiver_object_id')

    content = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    is_read = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    room_name = models.CharField(max_length=100, default='global')

    reaction = models.CharField(max_length=10, blank=True, null=True) 

    def __str__(self):
        return f"{self.sender} to {self.receiver}: {self.content[:30]}"