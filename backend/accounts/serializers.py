from rest_framework import serializers
from .models import StandardUser, BusinessSubject, Client
from django.contrib.auth.models import User

class StandardUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = StandardUser
        fields = ['id', 'username', 'email', 'phone', 'address']

class BusinessSubjectSerializer(serializers.ModelSerializer):
    user = StandardUserSerializer()

    class Meta:
        model = BusinessSubject
        fields = ['id', 'user', 'business_name', 'registration_number', 'website', 'contact_email']

class ClientSerializer(serializers.ModelSerializer):
    user = StandardUserSerializer()

    class Meta:
        model = Client
        fields = ['id', 'user', 'date_of_birth', 'profile_picture', 'bio']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        # Create the user with the provided data
        user = User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user        
