from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'sender', 'notification_type', 'is_read', 'created_at')
    search_fields = ('recipient__username', 'sender__username', 'notification_type')
    list_filter = ('is_read', 'notification_type', 'created_at')