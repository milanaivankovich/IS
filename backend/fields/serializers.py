from rest_framework import serializers
from .models import Field, Sport

class SportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sport
        fields = ['id', 'name']  

class FieldSerializer(serializers.ModelSerializer):
    sports = SportSerializer(many=True)  

    class Meta:
        model = Field
        fields = ['id', 'location', 'precise_location', 'latitude', 'longitude', 'sports', 'is_suspended', 'image']