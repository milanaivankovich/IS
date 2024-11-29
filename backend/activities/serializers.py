from rest_framework import serializers
from .models import Activities

class ActivitiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activities
        fields = ['id', 'name', 'description', 'client', 'date', 'time', 'numberOfParticipants']
