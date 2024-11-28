from django.apps import AppConfig


class AdvertisementsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'advertisements'

    def ready(self):
        import advertisements.signals
