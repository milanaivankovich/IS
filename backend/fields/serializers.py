from rest_framework import serializers  # type: ignore
from .models import Field   

class FieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = Field
        fields = '__all__'