# myapp/management/commands/run_task_on_startup.py

from django.core.management.base import BaseCommand
from notifications.tasks import activity_starting_soon_notification, filter_and_send_notifications
from background_task.models import Task

class Command(BaseCommand):
    help = 'Run background task on server start'

    def handle(self, *args, **kwargs):
        '''
        task_to_delete = Task.objects.filter(task_name="notifications.tasks.activity_starting_soon_notification")
        if task_to_delete: 
            print("task deleted!")
            task_to_delete.delete()
        task_to_delete = Task.objects.filter(task_name="notifications.tasks.filter_and_send_notifications")
        if task_to_delete: 
            print("task deleted!")
            task_to_delete.delete()
        
        tasks = Task.objects.all()
        for task in tasks:
            print(f"{task.task_name} + {task.task_hash}")
        '''

        if not Task.objects.filter(task_name="notifications.tasks.activity_starting_soon_notification").exists():
            activity_starting_soon_notification(schedule=0, repeat=60)
            self.stdout.write(self.style.SUCCESS('Successfully added new task.'))
        else: 
            self.stdout.write(self.style.ERROR('Duplicate task'))
        if not Task.objects.filter(task_name="notifications.tasks.filter_and_send_notifications").exists():
            filter_and_send_notifications(schedule=0, repeat=30)
            self.stdout.write(self.style.SUCCESS('Successfully added new task.'))
        else: 
            self.stdout.write(self.style.ERROR('Duplicate task'))

