# Generated by Django 5.1.4 on 2025-03-22 15:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notification',
            name='notification_type',
            field=models.CharField(choices=[('odjava', 'Odjava'), ('prijava', 'Prijava'), ('komentar', 'Komentar'), ('uskoro', 'Uskoro'), ('azuriranje', 'Update')], max_length=20),
        ),
    ]
