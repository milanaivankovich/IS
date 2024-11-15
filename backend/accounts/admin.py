from django.contrib import admin
from .models import BusinessSubject, StandardUser, Client
from activities.models import Aktivnost #dodala Milica

admin.site.register(BusinessSubject)
admin.site.register(StandardUser)
admin.site.register(Client)


