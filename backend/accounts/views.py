from rest_framework import viewsets
from .models import StandardUser, BusinessSubject, Client
from .serializers import StandardUserSerializer, BusinessSubjectSerializer, ClientSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view,  authentication_classes, permission_classes
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.auth import authenticate


class StandardUserViewSet(viewsets.ModelViewSet):
    queryset = StandardUser.objects.all()
    serializer_class = StandardUserSerializer
    permission_classes = [IsAuthenticated]

class BusinessSubjectViewSet(viewsets.ModelViewSet):
    queryset = BusinessSubject.objects.all()
    serializer_class = BusinessSubjectSerializer
    permission_classes = [IsAuthenticated]

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]

class UserRegistrationView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['PUT'])
def edit_standard_user(request, pk):
    user = StandardUser.objects.get(pk=pk)
    serializer = StandardUserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
def edit_client(request, pk):
    try:
        user = Client.objects.get(pk=pk)
    except Client.DoesNotExist:
        return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ClientSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_client(request, pk):
    try:
        user = Client.objects.get(pk=pk)
    except Client.DoesNotExist:
        return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ClientSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_business_subject(request, pk):
    try:
        user = BusinessSubject.objects.get(pk=pk)
    except BusinessSubject.DoesNotExist:
        return Response({"error": "Business Subject not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = BusinessSubjectSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(['PUT'])
def edit_business_subject(request, pk):
    user = BusinessSubject.objects.get(pk=pk)
    serializer = BusinessSubjectSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
def register_standard_user(request):
    serializer = StandardUserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token = Token.objects.create(user=user)
        return Response({"token": token.key}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def register_business_subject(request):
    serializer = BusinessSubjectSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token = Token.objects.create(user=user)
        return Response({"token": token.key}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def register_client(request):
    # Deserialize the incoming registration data
    serializer = ClientSerializer(data=request.data)
    
    if serializer.is_valid():
        # Save the user data and create the user
        user = serializer.save()

        # Create a profile for the client
        client_profile = Client.objects.create(user=user)

        # If you want to create a business subject, you can do something like this:
        # business_subject_profile = BusinessSubject.objects.create(user=user)

        # Generate an auth token for the user
        token = Token.objects.create(user=user)

        # Serialize the profile to send back in the response
        client_serializer = ClientSerializer(client_profile)

        return Response({
            "token": token.key,
            "profile": client_serializer.data  # Return the user's profile data here
        }, status=status.HTTP_201_CREATED)
    
    # If the data isn't valid, return an error response
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    # Authenticate user
    user = authenticate(username=username, password=password)
    if user is None:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

    # Create or retrieve the auth token
    token, created = Token.objects.get_or_create(user=user)

    # Prepare the response data
    user_data = {}
    user_type = None

    # Check if the user is a Client
    try:
        client = Client.objects.get(user=user)
        user_type = "Client"
        user_data = ClientSerializer(client).data  # Serialize client profile
    except Client.DoesNotExist:
        client = None
    
    # Check if the user is a Business Subject
    try:
        business_subject = BusinessSubject.objects.get(user=user)
        user_type = "BusinessSubject"
        user_data = BusinessSubjectSerializer(business_subject).data  # Serialize business profile
    except BusinessSubject.DoesNotExist:
        business_subject = None
    
    if not (client or business_subject):
        return Response({"error": "No associated user type found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Return the authentication token, user type, and the user profile data
    return Response({
        'token': token.key,
        'user_id': user.pk,
        'username': user.username,
        'user_type': user_type,
        'user_data': user_data  # Returning the profile data here
    }, status=status.HTTP_200_OK)    


@api_view(['POST'])
def logout_user(request):
    # Get the token from the request headers
    auth_token = request.auth

    if not auth_token:
        return Response({"error": "No authentication token provided"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Delete the token, effectively logging the user out
        token = Token.objects.get(key=auth_token)
        token.delete()
        return Response({"message": "User logged out successfully"}, status=status.HTTP_200_OK)
    except Token.DoesNotExist:
        return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@authentication_classes([TokenAuthentication])  # Ensures that the user is authenticated with a token
@permission_classes([IsAuthenticated])  # Ensures that the user is authenticated
def get_profile(request):
    # Get the user object based on the request's user (authenticated user)
    user = request.user

    user_data = {}
    user_type = None

    # Check if the user is a Client
    try:
        client = Client.objects.get(user=user)
        user_type = "Client"
        user_data = ClientSerializer(client).data  # Serialize the client profile data
    except Client.DoesNotExist:
        client = None

    # Check if the user is a Business Subject
    try:
        business_subject = BusinessSubject.objects.get(user=user)
        user_type = "BusinessSubject"
        user_data = BusinessSubjectSerializer(business_subject).data  # Serialize the business subject profile data
    except BusinessSubject.DoesNotExist:
        business_subject = None

    if not (client or business_subject):
        return Response({"error": "No associated user profile found"}, status=status.HTTP_404_NOT_FOUND)

    # Return the profile data for the logged-in user
    return Response({
        'user_id': user.pk,
        'username': user.username,
        'user_type': user_type,
        'user_data': user_data  # The profile data for the logged-in user
    }, status=status.HTTP_200_OK)        