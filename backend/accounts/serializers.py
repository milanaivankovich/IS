from rest_framework import serializers
from .models import  BusinessSubject, Client
from django.contrib.auth.models import User



class BusinessSubjectSerializer(serializers.ModelSerializer):
    # Define the necessary fields explicitly
    nameSportOrganization = serializers.CharField(max_length=255, source='business_name', required=False)
    description = serializers.CharField(allow_blank=True, required=False)
    email = serializers.EmailField(required=False)
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    # Don't need to include 'first_name', 'last_name', and 'username' as they're removed in the model

    class Meta:
        model = BusinessSubject
        fields = ['nameSportOrganization', 'profile_picture', 'description', 'email', 'password']  # Only include relevant fields

    def validate_email(self, value):
        instance = self.instance  # Current instance being updated
        if instance and instance.email == value:
            return value  # Skip validation if the email hasn't changed

        # Check if the email is being updated and is unique
        if BusinessSubject.objects.filter(email=value).exists() or Client.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_nameSportOrganization(self, value):
        # Ensure the name is unique if required
        instance = self.instance
        if instance and instance.business_name == value:
            return value  # Skip validation if the name hasn't changed

        # Check if the business name is unique
        if BusinessSubject.objects.filter(business_name=value).exists():
            raise serializers.ValidationError("A business with this name already exists.")
        
        # Add any other custom validation here, e.g., length or prohibited characters
        if len(value) < 3:
            raise serializers.ValidationError("The business name must be at least 3 characters long.")
        return value    

    def update(self, instance, validated_data):
        # Handle password update separately if provided
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)

        # Update the instance with other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def create(self, validated_data):
        # Handle password separately
        password = validated_data.pop('password')
        user = BusinessSubject(**validated_data)
        user.set_password(password)
        user.save()
        return user

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
    first_name = serializers.CharField(max_length=30, required=False)
    last_name = serializers.CharField(max_length=30, required=False)
    username = serializers.CharField(max_length=150, required=False)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    email = serializers.EmailField(required=False)
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Client
        fields = ['first_name', 'last_name', 'username', 'password', 'email', 'profile_picture']
    

    def validate_email(self, value):
        instance = self.instance  # Current instance being updated
        if instance and instance.email == value:
            return value  # Skip validation if the email hasn't changed

        # Check if the email is being updated and is unique
        if BusinessSubject.objects.filter(email=value).exists() or Client.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        instance = self.instance  # Current instance being updated
        if instance and instance.username == value:
            return value  # Skip validation if the username hasn't changed

        # Check if the username is being updated and is unique
        if Client.objects.filter(username=value).exists():
            raise serializers.ValidationError("A client with this username already exists.")
        return value

    def update(self, instance, validated_data):
        # Handle password update separately if provided
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)

        # Update the instance with other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def create(self, validated_data):
        # Extract the password from the validated data and create the user
        password = validated_data.pop('password')
        
        # Create the user instance
        user = Client(**validated_data)
        user.set_password(password)
        user.save()
        
        return user



