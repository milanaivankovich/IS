from django.db import models
from accounts.models import Client
from activities.models import Activities
from activities.models import Comment

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('odjava', 'Odjava'),
        ('prijava', 'Prijava'),
        ('komentar', 'Komentar'),
        ('uskoro','Uskoro'),
         ('azuriranje', 'Update'), #za nadolazeci dogadjaj
        #('new_post', 'New Post'),
    ]
     
    recipient = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='recieve_notifications')
    post = models.ForeignKey(Activities, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='sent_notifications') # null=true ako je sistemska notifikacija
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        if self.comment:
            return f"{self.sender} - {self.notification_type} - {self.comment.post.title} (Comment)"
        return f"{self.sender} - {self.notification_type} - {self.post.title}"
'''
class WebPushInfo(models.Model):
    endpoint = models.URLField(max_length=200)
    p256dh = models.CharField(max_length=255)
    auth = models.CharField(max_length=255)
    # Optionally, add more fields such as "expiration time" or "platform" for more detailed information
    subscription_date = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"WebPush info for {self.user.username}"

    class Meta:
        verbose_name = "WebPush Info"
        verbose_name_plural = "WebPush Infos"
'''