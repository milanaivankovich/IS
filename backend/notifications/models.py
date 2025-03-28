from django.db import models
from accounts.models import Client, BusinessSubject
from activities.models import Activities
from activities.models import Comment

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('odjava', 'Odjava'),
        ('prijava', 'Prijava'),
        ('komentar', 'Komentar'),
        ('uskoro','Uskoro'),
        ('activity_delete','ACTIVITY_DELETE'),
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

from push_notifications.models import WebPushDevice

class WebPushInfo(models.Model):
    user = models.ForeignKey(Client, related_name='devices', on_delete=models.CASCADE)
    device = models.ForeignKey(WebPushDevice, related_name='registrations', on_delete=models.CASCADE)    

    def __str__(self):
        return f"Device Registration for {self.user.username}: {self.device.registration_id}"

    class Meta:
        unique_together = ('user', 'device')

class WebPushInfoBusinessSubject(models.Model):
    subject = models.ForeignKey(BusinessSubject, related_name='subject_device', on_delete=models.CASCADE)
    device = models.ForeignKey(WebPushDevice, related_name='subject_registration', on_delete=models.CASCADE)    

    def __str__(self):
        return f"Device Registration for {self.subject.id}: {self.device.registration_id}"

    class Meta:
        unique_together = ('subject', 'device')
