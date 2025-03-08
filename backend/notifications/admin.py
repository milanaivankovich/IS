from django.contrib import admin
from .models import Notification

# Optionally, you can create a custom admin class to customize the way notifications appear in the admin
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'sender', 'notification_type', 'created_at', 'is_read')
    list_filter = ('notification_type', 'is_read')
    search_fields = ('recipient__username', 'sender__username', 'content')
    ordering = ('created_at',)

    # You can also customize the admin form for the Notification model
    # fields = ('recipient', 'sender', 'notification_type', 'content', 'is_read')

admin.site.register(Notification, NotificationAdmin)