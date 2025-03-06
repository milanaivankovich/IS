from django.db import models
from django.contrib.auth.models import User
from .models import Activities
from .models import Comment

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('odjava', 'Odjava'),
        ('prijava', 'Prijava'),
        ('komentar', 'Komentar'),
        #('new_post', 'New Post'),
    ]
     
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    post = models.ForeignKey(Activities, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)

    def __str__(self):
        if self.comment:
            return f"{self.sender} - {self.notification_type} - {self.comment.post.title} (Comment)"
        return f"{self.sender} - {self.notification_type} - {self.post.title}"
