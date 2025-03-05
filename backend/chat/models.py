from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class Message(models.Model):
    sender_content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name="message_sender")
    sender_object_id = models.PositiveIntegerField()
    sender = GenericForeignKey("sender_content_type", "sender_object_id")

    receiver_content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name="message_receiver")
    receiver_object_id = models.PositiveIntegerField()
    receiver = GenericForeignKey("receiver_content_type", "receiver_object_id")

    room_name = models.CharField(max_length=255)  # Ensure this field exists

    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} -> {self.receiver}: {self.content[:20]}"
