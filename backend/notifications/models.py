from django.db import models
from accounts.models import Client, BusinessSubject
from activities.models import Activities
from activities.models import Comment
from advertisements.models import Advertisement
from django.core.exceptions import ValidationError

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
        db_table = 'webpushinfo'
        unique_together = ('user', 'device')

class WebPushInfoBusinessSubject(models.Model):
    subject = models.ForeignKey(BusinessSubject, related_name='subject_device', on_delete=models.CASCADE)
    device = models.ForeignKey(WebPushDevice, related_name='subject_registration', on_delete=models.CASCADE)    

    def __str__(self):
        return f"Device Registration for {self.subject.id}: {self.device.registration_id}"

    class Meta:
        unique_together = ('subject', 'device')

class NotificationGeneric(models.Model):
    NOTIFICATION_TYPES = [
        ('odjava', 'Odjava'),
        ('prijava', 'Prijava'),
        ('komentar', 'Komentar'),
        ('uskoro','Uskoro'),
        ('activity_delete','ACTIVITY_DELETE'),
        ('azuriranje', 'Update'), #za nadolazeci dogadjaj
        ('system', 'SYSTEM'),
    ]
     
    recipient_client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='recieve_notifications_client', null=True, blank=True)
    recipient_subject = models.ForeignKey(BusinessSubject, on_delete=models.CASCADE, related_name='recieve_notifications_client', null=True, blank=True)
    
    activity = models.ForeignKey(Activities, on_delete=models.CASCADE, related_name='notifications_activity', null=True, blank=True)
    advertisement = models.ForeignKey(Advertisement, on_delete=models.CASCADE, related_name='notifications_advertisement', null=True, blank=True)
    
    sender_client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='sent_notifications_client',null=True, blank=True) # null=true ako je sistemska notifikacija
    sender_subject = models.ForeignKey(BusinessSubject, on_delete=models.CASCADE, related_name='sent_notifications_subject',null=True, blank=True) # null=true ako je sistemska notifikacija
    
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='notifications_comment', null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)

    def __str__(self):
        if self.comment:
            return f"{self.sender_client} - {self.notification_type} - {self.comment} (Comment)"
        return f"{self.sender_client} - {self.notification_type} - {self.activity}"
    
    def clean(self):
        if (self.sender_client and self.sender_subject):
            raise ValidationError("Sender must be either an individual client or a business client, but not both. If none then it is system notification")
        if (self.recipient_client and self.recipient_subject) or (not self.recipient_client and not self.recipient_subject):
            raise ValidationError("Recipient must be either an individual client or a business client, but not both.")
        
class Preferences(models.Model):
    email_notifications = models.BooleanField(default=False)
    group_notifications = models.BooleanField(default=False)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='client_preference', null=True, blank=True)
    subject = models.ForeignKey(BusinessSubject, on_delete=models.CASCADE, related_name='subject_preference', null=True, blank=True)
    
    def __str__(self):
        return f"{self.client} - {self.subject}  : {self.email_notifications} - {self.group_notifications}"
    
    def clean(self):
        if (self.client and self.subject) or (not self.client and not self.subject):
            raise ValidationError("Preference must have either a client or a business client, but not both.")
        