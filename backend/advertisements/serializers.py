from rest_framework import serializers 
from .models import Advertisement
from fields.models import Field, Sport  
from accounts.models import BusinessSubject 

class AdvertisementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Advertisement
        fields = '__all__'