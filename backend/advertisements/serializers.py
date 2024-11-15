from rest_framework import serializers # type: ignore
from .models import Advertisement

class AdvertisementSerializer(serializers.ModelSerializer): # type: ignore
    class Meta:
        model = Advertisement
        fields = '__all__'