from rest_framework import serializers
from .models import  BusinessSubject, Client
from django.contrib.auth.models import User




class BusinessSubjectSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = BusinessSubject
        fields = ['business_name', 'registration_number', 'website', 'contact_email']


# If UserRegistrationSerializer is defined in the same file
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)  # Ensure password is write-only

    class Meta:
        model = Client  # Reference Client model now
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'phone', 'address']

    def create(self, validated_data):
        # Create the client (which acts as the user)
        user = Client(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone=validated_data.get('phone', ''),
            address=validated_data.get('address', '')
        )
        user.set_password(validated_data['password'])  # Set the password correctly
        user.save()

        return user

class ClientSerializer(serializers.ModelSerializer):
    # Remove the 'user' field and directly define the necessary fields
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    email = serializers.EmailField()

    class Meta:
        model = Client
        fields = ['first_name', 'last_name', 'username', 'password', 'email', 'date_of_birth', 'bio']
    
    def create(self, validated_data):
        # Extract the password from the validated data and create the user
        password = validated_data.pop('password')
        
        # Create the user instance
        user = Client(**validated_data)
        user.set_password(password)
        user.save()
        
        return user

