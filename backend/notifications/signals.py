from django.db.models.signals import m2m_changed, post_save
from django.dispatch import receiver
from .models import Notification
from activities.models import Activities, Comment
from accounts.models import Client
from .utils import send_notification

@receiver(m2m_changed, sender=Activities.participants.through)
def participate_notification(sender, instance, action, reverse, pk_set, **kwargs):
    """
    Signals
    
    - `action == "post_add"` → A user participates.
    - `action == "post_remove"` → A user unparticipates.
    """
    print(f"Signal participants change for client {instance.client.username}")

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
            print(f"Signal for new notification participate for client {instance.client.username}")


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
            print(f"Signal for new notification unparticipate created for user {instance.client.username}")

@receiver(m2m_changed, sender=Activities.comments.through)
def comment_notification(sender, instance, action, reverse, pk_set, **kwargs):
    """
    Signals
    
    - `action == "post_add"` → A user comments.
    """
    print(f"Signal comment notification")

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
                print(f"Signal comment for client {instance.client.username}")

            
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
                    print(f"Signal comment for participant {participant.username}")

@receiver(post_save, sender=Activities)
def notify_on_post_update(sender, instance, created, **kwargs):
    """
    Sends a notification when a post is updated (not created).
    """
    for participant in instance.participants.all():
                 #da ne salje sam sebi
        new_notification = Notification.objects.create(

                        recipient=participant,  # Notify the post author
                        sender=instance.client,  # The user who liked the post
                        post=instance,
                        notification_type='azuriranje',  # Set notification type
                        content=f"{instance.client.username} ažurira događaj na koji ste prijavljeni.",
                    )
        send_notification(participant.id ,new_notification)


