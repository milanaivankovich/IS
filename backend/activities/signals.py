from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Activities
import json

@receiver([post_save, post_delete], sender=Activities)
def update_json_file(sender, instance, **kwargs):
    activities = list(Activities.objects.all().values())
    for activity in activities:
        if 'date' in activity and activity['date']:
            activity['date'] = activity['date'].strftime('%Y-%m-%d')

    with open('dataActivities.json', 'w', encoding='utf-8') as f:
        json.dump(activities, f, ensure_ascii=False, indent=4)
