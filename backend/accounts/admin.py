from django.contrib import admin
from .models import BusinessSubject, Client
from activities.models import Aktivnost #dodala Milica
from fields.models import Field
from reviews.models import Review 
from advertisements.models import Advertisement

admin.site.register(BusinessSubject)

admin.site.register(Client)
admin.site.register(Field)
admin.site.register(Review)
admin.site.register(Advertisement)