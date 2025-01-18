from django.contrib import admin
from .models import Activities, Comment

class ActivitiesAdmin(admin.ModelAdmin):
    list_display = ('titel', 'description', 'date', 'NumberOfParticipants', 'sport', 'field', 'get_client_username')
    list_filter = ('date',)
    search_fields = ('titel', 'description', 'client__username')
    
    def get_client_username(self, obj):
        return obj.client.username if obj.client else "No client"
    get_client_username.short_description = 'Client Username'
    
admin.site.register(Activities)
admin.site.register(Comment)