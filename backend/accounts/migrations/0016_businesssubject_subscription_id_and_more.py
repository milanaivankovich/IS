# Generated by Django 5.1.4 on 2025-06-29 17:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0015_remove_client_webpush_info'),
    ]

    operations = [
        migrations.AddField(
            model_name='businesssubject',
            name='subscription_id',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='businesssubject',
            name='subscription_status',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
