from rest_framework import serializers
from .models import StandardUser, BusinessSubject, Client
from django.contrib.auth.models import User

# Serializer for StandardUser
class StandardUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = StandardUser
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'phone', 'address']

class BusinessSubjectSerializer(serializers.ModelSerializer):
    user = StandardUserSerializer()

    class Meta:
        model = BusinessSubject
        fields = ['business_name', 'registration_number', 'website', 'contact_email']


# Serializer for Client
class ClientSerializer(serializers.ModelSerializer):
    user = StandardUserSerializer()

    class Meta:
        model = Client
        fields = ['user', 'date_of_birth', 'profile_picture', 'bio']

    def create(self, validated_data):
        # Extract the user data from the validated data
        user_data = validated_data.pop('user')
        
        # Create the StandardUser instance
        user = StandardUser.objects.create(**user_data)
        # Create the associated Client instance
        client = Client.objects.create(user=user, **validated_data)
        
        return client

# Serializer for User Registration
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = StandardUser
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'phone', 'address']

    def create(self, validated_data):
        # Create the user with the provided data
        user = StandardUser(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone=validated_data.get('phone', ''),
            address=validated_data.get('address', '')
        )
        user.set_password(validated_data['password'])
        user.save()

        # Create a client profile after creating the user
        Client.objects.create(user=user)

        return user
  
