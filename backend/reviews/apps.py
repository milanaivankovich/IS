from django.apps import AppConfig


class FieldsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'reviews'
    
    def ready(self):
        import reviews.signals

