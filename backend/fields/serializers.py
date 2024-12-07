from rest_framework import serializers
from .models import Field, Sport

class SportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sport
        fields = ['name']  # Samo ime sporta

class FieldSerializer(serializers.ModelSerializer):
    sports = SportSerializer(many=True)  # Koristimo SportSerializer za sports polje

    class Meta:
        model = Field
        fields = ['id', 'location', 'latitude', 'longitude', 'sports', 'is_suspended', 'image']