from rest_framework import serializers
from .models import Aktivnost

class AktivnostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aktivnost
        fields = ['id', 'naziv', 'opis', 'client']
