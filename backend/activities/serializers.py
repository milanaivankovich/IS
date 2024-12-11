from rest_framework import serializers
from .models import Activities

class ActivitiesSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='client.username', read_only=True)

    class Meta:
        model = Activities
        fields = '__all__'
