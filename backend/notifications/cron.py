# myapp/cron.py
from django_cron import CronJobBase, Schedule
from django.core.mail import send_mail
from django.utils import timezone
from activities.models import Activities
from accounts.models import Client
from .models import Notification
from .utils import send_notification

'''
class MyCronJob(CronJobBase):
    # Define the schedule for the cron job
    schedule = Schedule(run_every_mins=1)  # Runs every hour (adjust as needed)
    code = 'myproject.activitiy_will_start_in_30_minutes'  # A unique code for the cron job

    def do(self):
        # This is where you define what the cron job does
        current_time = timezone.now()
        threshold = timezone.timedelta(hours=1)  # Adjust based on your requirement

        posts_to_notify = Activities.objects.filter(date=current_time + threshold)

        for post in posts_to_notify:
            #notifikacija za kreatora dogadjaja
            creator = Client.objects.get(pk=post.client)
            new_notification= Notification.objects.create(

                recipient=creator,  # Notify the post author
                sender=creator,  # potencijalni problem
                post=post,
                notification_type='uskoro',  # Set notification type
                content=f"Događaj korisnika @{user.username} se održava uskoro", #todo staviti neki format dateTime
            )
            send_notification(creator.id, new_notification)
            for user_id in post.participants:
                user = Client.objects.get(pk=user_id)
                new_notification = Notification.objects.create(

                recipient=instance.client,  # Notify the post author
                sender=user,  # The user who liked the post
                post=instance,
                notification_type='prijava',  # Set notification type
                content=f"{user.username} se prijavio na događaj!",
            )
            send_notification(instance.client.id,new_notification)
            print(f"Signal for new notification participate for client {instance.client.username}")
            
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
