
from django.core.mail import send_mail
from django.utils import timezone
from datetime import datetime
from activities.models import Activities
from accounts.models import Client
from .models import Notification
from .utils import send_notification
from .webpush import send_push_notification_to_all_user_devices
from django.conf import settings

from background_task import background

@background(schedule=10) #schedule je vrijeme nakon kojeg pocinje task
def activity_starting_soon_notification():

    timezone.activate(settings.TIME_ZONE) 
    print(f"This task runs every minute!", timezone.localtime(timezone.now()))

    #kako iskoristiti funkciju nakon sto se dogadjaj napravi, i izmjeni vrijeme (schedule se mora racunati?)
    current_time = timezone.localtime(timezone.now())
    threshold = timezone.timedelta(minutes=30)  # vremensko odstupanje
    small_step = timezone.timedelta(minutes=1) # jer je nemoguce porediti sekunde
    
    #localized_datetime = current_time.replace(tzinfo=timezone_offset)
    #now = datetime(current_time.day, current_time.month, current_time.year, current_time.hour+2, current_time.minute)

    posts_to_notify = Activities.objects.filter(date__gt=current_time +threshold, date__lte=current_time+small_step+threshold)
    if posts_to_notify: print("Upcoming events found")
    for post in posts_to_notify:
            #notifikacija za kreatora dogadjaja
        creator = post.client
        new_notification= Notification.objects.create(
        recipient=creator,  # Notify the post author
        sender=creator,  # potencijalni problem
        post=post,
        notification_type='uskoro',  # Set notification type
        content=f"Događaj korisnika @{user.username} se održava uskoro", #todo staviti neki format dateTime
        )
        send_notification(creator.id, new_notification)
        send_push_notification_to_all_user_devices(new_notification.recipient, f"@{new_notification.sender}", new_notification.content, f"@{new_notification.sender}/{new_notification.notification_type}")

        #notifikacija za participante
        for user_id in post.participants:
            user = Client.objects.get(pk=user_id)
            new_notification = Notification.objects.create(

            recipient=user,  # Notify the post author
            sender=creator,  # The user who liked the post
            post=post,
            notification_type='uskoro',  # Set notification type
            content=f"Događaj korisnika @{user.username} se održava uskoro",
            )
            send_notification(user.id, new_notification)
            send_push_notification_to_all_user_devices(new_notification.recipient, f"@{new_notification.sender}", new_notification.content, f"@{new_notification.sender}/{new_notification.notification_type}")


    '''      
            # Example: Send an email notification
            send_mail(
                'Nadolazeći dogadjaj',
                f'Događaj "{post.titel}" je zakazan u {post.date} na terenu {post.field.name}',
                'ocenekonabasketbl@gmail.com',  # Replace with your email
                [post.client.email],  # Assuming the Post model has a 'user' field
            )
#bolji nacin
            if __name__ == "__main__":
    to_email = "anastasija.milenic@student.etf.unibl.org"  # Change to your email address
    subject = "Test Email"
    message = "This is a test email sent from Python!"
    send_email_via_gmail(to_email, subject, message)

            '''
