from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Field
import json
from django.db import connection

@receiver([post_save, post_delete], sender=Field)
def update_json_file(sender, instance, **kwargs):
    fields = list(Field.objects.values())
    
    with open('dataField.json', 'w', encoding='utf-8') as f:
        json.dump(fields, f, ensure_ascii=False, indent=4)

    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='fields_field';")
 