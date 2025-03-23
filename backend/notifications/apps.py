# apps.py
from django.apps import AppConfig

class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notifications'

    def ready(self):  
        import notifications.signals
        from notifications.tasks import activity_starting_soon_notification
        activity_starting_soon_notification(schedule=60, repeat=60)