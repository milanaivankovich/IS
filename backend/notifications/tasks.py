
from django.core.mail import send_mail
from django.utils import timezone
from datetime import datetime
from activities.models import Activities
from accounts.models import Client
from .models import NotificationGeneric, Preferences
from .utils import send_notification_generic
from .webpush import send_push_notification_to_all_user_devices
from django.conf import settings
from accounts.views import send_email_via_gmail 
from background_task import background

@background(schedule=10) #schedule je vrijeme nakon kojeg pocinje task
def activity_starting_soon_notification():

    timezone.activate(settings.TIME_ZONE) 
    print(f"This task runs every minute!", timezone.now())

    #kako iskoristiti funkciju nakon sto se dogadjaj napravi, i izmjeni vrijeme (schedule se mora racunati?)
    current_time = timezone.now()
    threshold = timezone.timedelta(minutes=30)  # vremensko odstupanje
    small_step = timezone.timedelta(minutes=1) # jer je nemoguce porediti sekunde
    
    #localized_datetime = current_time.replace(tzinfo=timezone_offset)
    #now = datetime(current_time.day, current_time.month, current_time.year, current_time.hour+2, current_time.minute)

    posts_to_notify = Activities.objects.filter(date__gt=current_time +threshold, date__lte=current_time+small_step+threshold)
    
    #events = Activities.objects.all()
    #for event in events:
    #   if event.date>current_time:
    #        print(f"Event: {event.date}, Local Time: {event.titel} ")
            
    
    if posts_to_notify: print("Upcoming events found")
    for post in posts_to_notify:
            #notifikacija za kreatora dogadjaja
        creator = post.client
        new_notification= NotificationGeneric.objects.create(
        recipient_client=creator,  # Notify the post author
        sender_client=creator,  # potencijalni problem
        activity=post,
        notification_type='uskoro',  # Set notification type
        content=f"Događaj korisnika @{post.client} se održava uskoro", #todo staviti neki format dateTime
        )
        send_notification_generic(f"Client{creator.id}", new_notification)
        send_push_notification_to_all_user_devices(new_notification.recipient_client, f"@{new_notification.sender_client}", new_notification.content, f"@{new_notification.sender_client}/{new_notification.notification_type}")
        send_email_notification(new_notification.recipient_client, new_notification.activity)
        new_notification.is_sent=True
        new_notification.save()
        #notifikacija za participante
        for user in post.participants.all():
            new_notification = NotificationGeneric.objects.create(

            recipient_client=user,  # Notify the post author
            sender_client=creator,  # The user who liked the post
            activity=post,
            notification_type='uskoro',  # Set notification type
            content=f"Događaj korisnika @{user.username} se održava uskoro",
            )
            send_notification_generic(f"Client{user.id}", new_notification)
            send_push_notification_to_all_user_devices(new_notification.recipient_client, f"@{new_notification.sender_client.username}", new_notification.content, f"@{new_notification.sender_client.username}/{new_notification.notification_type}")
            send_email_notification(new_notification.recipient_client, new_notification.activity)
            new_notification.is_sent=True
            new_notification.save()


     #task za filter notifikacija
from django.db.models import Count
from accounts.models import BusinessSubject
from advertisements.models import Advertisement

@background(schedule=10) #schedule je vrijeme nakon kojeg pocinje task
def filter_and_send_notifications():
    print("filter notifications activated!")
    
    not_deleted = NotificationGeneric.objects.filter(is_deleted=False, is_sent=False)
    #logika za ciscenje, grupe gdje se sve poklapa (ne mora biti isti posiljalac, akcenat na dogadjaju)
    grouped_by_recipient = not_deleted.values(
    'recipient_client', 
    'recipient_subject',
    #'content',
    'notification_type',
    'advertisement',
    'activity' #ovo su polja koja ce imati grupa, nema sender!
    ).annotate(
        total=Count('id'),
        #senders=GroupConcat("sender")
        )
    for item in grouped_by_recipient:
        if item['total']<=1: continue
        client = Client.objects.filter(id=item['recipient_client']).first()
        subject = BusinessSubject.objects.filter(id=item['recipient_subject']).first()
        activity = Activities.objects.filter(id=item['activity']).first()
        advertisement = Advertisement.objects.filter(id=item['advertisement']).first()
        type=item['notification_type']
        #print(f"activity [{activity}], advertisement [{advertisement}], {type}")
        
        #provjeriti opcije korisnika
        if client:
            preferences, is_created = Preferences.objects.get_or_create(client=client)
        elif subject:
            preferences, is_created = Preferences.objects.get_or_create(subject=subject)
        

        if not preferences.group_notifications: continue
        #filtrirati notifikacije za brisanje
        to_delete = NotificationGeneric.objects.filter( #moze se iskoristiti za dobijanje imena participanata etc
                recipient_client= client, 
                recipient_subject= subject,
                #'content',
                notification_type= type,
                activity = activity,
                advertisement=advertisement,
            ).order_by('-created_at')
           #samo prvobitne obrisati posljednji mora ostati
        to_delete.update(is_deleted=True)

        #if to_delete.count() <= 1: continue #ako je samo jedna ostaviti je
        sender_client = to_delete.first().sender_client
        sender_subject =  to_delete.first().sender_subject
        content = to_delete.first().content

        if type == 'prijava': content = f"Nove prijave za događaj"
        elif type == 'odjava': content = f"Nove odjave za događaj"
        elif type == 'komentar': content = f"Imate nove komentare"

            #pravimo novu grupnu notifikaciju ako je potrebna
        group_notification = NotificationGeneric.objects.create(
                sender_client = sender_client,
                sender_subject = sender_subject,
                recipient_client=client,
                recipient_subject=subject,
                content=content,
                notification_type = type,
                activity=activity,
                advertisement=advertisement,
            )
        #print("new notification: ", group_notification)
    not_sent = NotificationGeneric.objects.filter(is_sent=False, is_deleted=False)
    for notif in not_sent:
        if notif.sender_client:
            sender = notif.sender_client
        else: sender = notif.sender_subject
        if notif.recipient_client:
            recipient = notif.recipient_client
        else: 
            recipient = notif.recipient_subject

        send_notification_generic(f"Client{recipient.id}",notif)
        send_push_notification_to_all_user_devices(recipient, f"@{sender.username}", notif.content, f"@{sender.username}/{notif.notification_type}")
        notif.is_sent = True
        notif.save()


def send_email_notification(client, activity):
    if client:
        preferences, is_created = Preferences.objects.get_or_create(client=client)
    #slanje putem maila za notifikacije 30 min prije dogadjaja
    if preferences.email_notifications:
        send_email_via_gmail(client.email, 
                             f"Obavještenje o nadolazećem događaju",
        f"""Informacije o predstojećem događaju:

            Naziv događaja: {activity.titel}
            Datum i vreme: {timezone.localtime(activity.date).strftime("%d/%m/%Y %H:%M")}
            Lokacija: {activity.field.location}
            Sport: {activity.sport.name}
            
            Napomena: Ova poruka je automatski generisana. Molimo vas da ne odgovarate na ovu email adresu.
            
            Sa poštovanjem,  
            'Oće neko na basket
            """)
