from django.contrib import admin
from .models import BusinessSubject, Client
from activities.models import Aktivnost #dodala Milica

admin.site.register(BusinessSubject)

admin.site.register(Client)