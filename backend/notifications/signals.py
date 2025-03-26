from django.db.models.signals import m2m_changed, post_save, pre_save
from django.dispatch import receiver
from .models import Notification
from activities.models import Activities, Comment
from accounts.models import Client
from .utils import send_notification
from .webpush import send_push_notification_to_all_user_devices

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
            new_notification = Notification.objects.create(

                recipient=instance.client,  # Notify the post author
                sender=user,  # The user who liked the post
                post=instance,
                notification_type='prijava',  # Set notification type
                content=f"{user.username} se prijavio na događaj.",
            )
            send_notification(instance.client.id,new_notification)
            send_push_notification_to_all_user_devices(new_notification.recipient, f"@{user.username}", new_notification.content, f"@{user.username}/{new_notification.notification_type}")


    elif action == "post_remove":  # User unliked the post
        for user_id in pk_set:
            user = Client.objects.get(pk=user_id)
            new_notification = Notification.objects.create(
                recipient=instance.client,  # Notify the post author
                sender=user,  # The user who liked the post
                post=instance,
                notification_type='odjava',  # Set notification type
                content=f"{user.username} se odjavio sa događaja.",
            )
            send_notification(instance.client.id,new_notification)
            send_push_notification_to_all_user_devices(new_notification.recipient, f"@{user.username}", new_notification.content, f"@{user.username}/{new_notification.notification_type}")

@receiver(m2m_changed, sender=Activities.comments.through)
def comment_notification(sender, instance, action, reverse, pk_set, **kwargs):
    """
    Signals
    
    - `action == "post_add"` → A user comments.
    """
    if action == "post_add":
        for comment_id in pk_set: #za svaki novi komentar poslati obavjest
            comment = Comment.objects.get(pk=comment_id)
            if (instance.client!=comment.client): #ako ne komentarisemo sami svoj dogadjaj poslati obavjest
                new_notification = Notification.objects.create(

                    recipient=instance.client,  # Notify the post author
                    sender=comment.client,  # The user who liked the post
                    post=instance,
                    notification_type='komentar',  # Set notification type
                    content=f"{comment.client.username} komentariše događaj: {instance.titel}.",
                    comment=comment
                )
                send_notification(instance.client.id,new_notification)
                send_push_notification_to_all_user_devices(new_notification.recipient, f"@{new_notification.sender.username}", new_notification.content, f"@{new_notification.sender.username}/{new_notification.notification_type}")

            
            #poslati obavjest drugim participantima
            for participant in instance.participants.all():
                if (participant!=comment.client): #da ne salje sam sebi
                    new_notification = Notification.objects.create(

                        recipient=participant,  # Notify the post author
                        sender=comment.client,  # The user who liked the post
                        post=instance,
                        notification_type='komentar',  # Set notification type
                        content=f"{comment.client.username} komentariše događaj: {instance.titel}.",
                        comment=comment
                    )
                    send_notification(participant.id ,new_notification)
                    send_push_notification_to_all_user_devices(new_notification.recipient, f"@{new_notification.sender.username}", new_notification.content, f"@{new_notification.sender.username}/{new_notification.notification_type}")

@receiver(pre_save, sender=Activities)
def notify_on_post_update(sender, instance, **kwargs):
    """
    Sends a notification when a post is updated (not created).
    """

    if instance.id:  # Ensure it's an update, not a new object
        old_instance = Activities.objects.get(id=instance.id)  # Get previous state
        #ako nije promjena participanta u pitanju
        old_participants = set(old_instance.participants.all())
        new_participants = set(instance.participants.all())
        if old_instance and old_participants == new_participants:  # Check if 'status' changed

            #ako je post obrisan
            if instance.is_deleted == True:
                notification_type='activity_delete'
                content=f"{instance.client.username} je uklonio događaj na koji ste prijavljeni."
            #ako nije obrisan
            else:
                notification_type='azuriranje'  # Set notification type
                content=f"{instance.client.username} ažurira događaj na koji ste prijavljeni."


            for participant in instance.participants.all():
                 #ne salje sam sebi
                new_notification = Notification.objects.create(

                        recipient=participant,  # Notify the post author
                        sender=instance.client,  # The user who liked the post
                        post=instance,
                        notification_type=notification_type,  # Set notification type
                        content=content,
                    )
                send_notification(participant.id ,new_notification)
                send_push_notification_to_all_user_devices(new_notification.recipient, f"@{new_notification.sender.username}", new_notification.content, f"@{new_notification.sender.username}/{new_notification.notification_type}")




