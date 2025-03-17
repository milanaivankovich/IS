from django.db import models
from accounts.models import Client
from activities.models import Activities
from activities.models import Comment

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('odjava', 'Odjava'),
        ('prijava', 'Prijava'),
        ('komentar', 'Komentar'),
        ('uskoro','Uskoro'), #za nadolazeci dogadjaj
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
