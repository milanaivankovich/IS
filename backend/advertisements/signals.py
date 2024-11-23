from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Advertisement 
import json
from django.db import connection

@receiver([post_save, post_delete], sender=Advertisement)
def update_json_file(sender, instance, **kwargs):
    advertisements = list(Advertisement.objects.all().values())
    for ad in advertisements:
        if 'date' in ad and ad['date']:
            ad['date'] = ad['date'].strftime('%Y-%m-%d')  # Format: 'YYYY-MM-DD'
    
    with open('dataAdvertisement.json', 'w', encoding='utf-8') as f:
        json.dump(advertisements, f, ensure_ascii=False, indent=4)

    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='advertisements_advertisement';")
