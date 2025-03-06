from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from .models import Notification
from backend.activities.models import Activities
from accounts.models import Client
from django.db.models import User

@receiver(m2m_changed, sender=Activities.participants.through)
def participate_notification(sender, instance, action, reverse, pk_set, **kwargs):
    """
    Signals
    
    - `action == "post_add"` → A user participates.
    - `action == "post_remove"` → A user unparticipates.
    """
    if action == "post_add":  # User liked the post
        for user_id in pk_set:
            user = Client.objects.get(pk=user_id)
            Notification.objects.create(

                recipient=instance.client,  # Notify the post author
                sender=user,  # The user who liked the post
                post=instance,
                notification_type='prijava',  # Set notification type
                content=f"{user.username} se prijavio na događaj!",
            )

    elif action == "post_remove":  # User unliked the post
        for user_id in pk_set:
            user = Client.objects.get(pk=user_id)
            Notification.objects.create(

                recipient=instance.client,  # Notify the post author
                sender=user,  # The user who liked the post
                post=instance,
                notification_type='odjava',  # Set notification type
                content=f"{user.username} se odjavio sa događaja!",
            )