from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Review
import json
from django.db import connection

@receiver([post_save, post_delete], sender=Review)
def update_json_file(sender, instance, **kwargs):
    reviews = list(Review.objects.values())
    
    with open('dataReview.json', 'w', encoding='utf-8') as f:
        json.dump(reviews, f, ensure_ascii=False, indent=4)

    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='reviews_review';")
 