# myapp/management/commands/run_task_on_startup.py

from django.core.management.base import BaseCommand
from notifications.tasks import activity_starting_soon_notification
from background_task.models import Task

class Command(BaseCommand):
    help = 'Run background task on server start'

    def handle(self, *args, **kwargs):
        if not Task.objects.filter(task_name="activity_starting_soon_notification", failed_at__isnull=True).exists():
            activity_starting_soon_notification(name="activity_starting_soon_notification", schedule=0, repeat=60)
            self.stdout.write(self.style.SUCCESS('Successfully started the task.'))
        else: 
            self.stdout.write(self.style.ERROR('Duplicate task'))
