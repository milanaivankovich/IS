from rest_framework import viewsets
from .models import  BusinessSubject, Client
from .serializers import  BusinessSubjectSerializer, ClientSerializer
from fields.serializers import FieldSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from accounts.authentication import custom_authenticate
from accounts.authentication import custom_authenticate_bs

from firebase_admin import auth
from django.http import JsonResponse

from django.views.decorators.csrf import csrf_exempt
import json

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from email.mime.text import MIMEText
import base64
from google.auth.transport.requests import Request

import os
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

from django.http import HttpResponse
from django.urls import path


from django.utils.crypto import get_random_string
from django.db import IntegrityError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from rest_framework.permissions import AllowAny
from .models import ClientToken
from .models import BusinessSubjectToken
import logging


from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404


from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view,  authentication_classes, permission_classes
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.auth import authenticate

from rest_framework import status
from django.db.models import Q
from django.contrib.auth import get_user_model
from fields.models import Field



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





from firebase_admin import auth

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.crypto import get_random_string
from firebase_admin import auth as firebase_auth
from .models import Client, ClientToken


def verify_firebase_token(token):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None


@csrf_exempt
def social_login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            
            token = data.get("id_token")
            email = data.get("email")
            display_name = data.get("displayName", "")
            photo_url = data.get("photoURL", "")

            if not token:
                return JsonResponse({"error": "No token provided"}, status=400)

            # Verify the Firebase token
            user_data = verify_firebase_token(token)
            if not user_data:
                return JsonResponse({"error": "Invalid token"}, status=401)

            # Split the display name
            name_parts = display_name.split(" ", 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ""

            # Update Firebase email verification
            try:
                firebase_auth.update_user(user_data["uid"], email_verified=True)
            except Exception:
                pass  # Log error but proceed

            # Create or get the client
            client, created = Client.objects.get_or_create(
                email=email,
                username=f"{first_name}{user_data['uid'][:5]}",
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "profile_picture": photo_url,
                    
                },
            )

           

            # Create token if user is new
            if created:
                client_token = ClientToken.objects.create(
                    key=get_random_string(40),
                    client=client
                )
            else:
                client_token = ClientToken.objects.get(client=client)

            # Return client details and token
            return JsonResponse({
                "uid": user_data["uid"],
                "email": user_data.get("email"),
                "name": f"{first_name} {last_name}",
                "photoURL": photo_url,
                "client_id": client.pk,
                "token": client_token.key,
            })

        except Exception as e:
            logger.error(f"Unexpected error during login: {str(e)}", exc_info=True)
            return JsonResponse({"error": "An unexpected error occurred"}, status=500)

    return JsonResponse({"error": "Invalid method"}, status=405)






from django.core.files.base import ContentFile
import requests



logger = logging.getLogger(__name__)

@api_view(["PUT"])
def edit_client(request, pk):
    # Extract token from the Authorization header
    token = request.headers.get('Authorization')  # Format: "Bearer <your_token>"
    if not token:
        logger.error("Authentication failed: No token provided.")
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        token_key = token.split(' ')[1]  # Extract actual token key
        client_token = ClientToken.objects.get(key=token_key)
        user = client_token.client  # Associated user
    except ClientToken.DoesNotExist:
        logger.error("Authentication failed: Invalid token or token expired.")
        return Response({"error": "Invalid token or token expired"}, status=status.HTTP_401_UNAUTHORIZED)

    # Verify the user is updating their own profile
    if user.pk != pk:
        logger.error(f"User {user.pk} attempted to edit another user's profile {pk}.")
        return Response({"error": "You can only edit your own profile"}, status=status.HTTP_403_FORBIDDEN)

    # Log request data
    logger.info(f"Request data for user {user.pk}: {request.data}")

    # Update first_name and last_name
    first_name = request.data.get("first_name")
    last_name = request.data.get("last_name")
    if first_name:
        user.first_name = first_name
    if last_name:
        user.last_name = last_name

    # Handle password change
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")
    if old_password and new_password and confirm_password:
        # Verify old password
        if not user.check_password(old_password):
            logger.error(f"Password update failed for user {user.pk}: Incorrect old password.")
            return Response({"error": "Old password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)
        if new_password != confirm_password:
            logger.error(f"Password update failed for user {user.pk}: Passwords do not match.")
            return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        logger.info(f"Password updated successfully for user {user.pk}.")

    # Handle profile picture
    if 'profile_picture' in request.FILES:
        user.profile_picture = request.FILES['profile_picture']
        logger.info(f"Profile picture updated for user {user.pk}.")

    # Save changes to user before serializing
    try:
        user.save()
        logger.info(f"User {user.pk} updated successfully: {user}.")
    except Exception as e:
        logger.error(f"Failed to save user {user.pk}: {e}")
        return Response({"error": "Failed to update user."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Now, update additional fields using the serializer
    try:
        client = Client.objects.get(pk=pk)
        serializer = ClientSerializer(client, data=request.data, partial=True)
        
        # Validate the serializer before saving the instance
        if serializer.is_valid():  # This is the point where you check if the serializer is valid
            serializer.save()
            logger.info(f"Client {pk} updated successfully in database.")
        else:
            logger.error(f"Validation failed for client {pk}: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Client.DoesNotExist:
        logger.error(f"Client with ID {pk} not found.")
        return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Failed to update client {pk}: {e}")
        return Response({"error": "Failed to update client."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Inspect the database after updates
    try:
        updated_client = Client.objects.get(pk=pk)
        logger.info(f"Database inspection: Updated client {updated_client}.")
    except Exception as e:
        logger.error(f"Failed to fetch updated client {pk} from database: {e}")

    return Response({"message": "Client updated successfully."}, status=status.HTTP_200_OK)





@api_view(["GET"])
def get_user_pk_by_token(request):
    # Retrieve the token from the Authorization header
    token = request.headers.get('Authorization')  # Expected format: "Token <your_token>"
    
    if not token:
        return Response({"error": "Authentication token required"}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        # Extract the actual token key from the "Token <token>" format
        token_key = token.split(' ')[1]  # Assumes "Token <token>"
        
        # Retrieve the token object from the database
        client_token = ClientToken.objects.get(key=token_key)
        
        # Retrieve the client associated with this token
        user = client_token.client  # Assuming a reverse relationship 'client' exists
        return Response({"pk": user.pk}, status=status.HTTP_200_OK)

    except IndexError:
        return Response({"error": "Invalid token format"}, status=status.HTTP_400_BAD_REQUEST)
    except ClientToken.DoesNotExist:
        return Response({"error": "Invalid token or token expired"}, status=status.HTTP_401_UNAUTHORIZED)    

@api_view(['GET'])
def get_client(request, pk):
    try:
        user = Client.objects.get(pk=pk)
    except Client.DoesNotExist:
        return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ClientSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_user_type_and_id(request):    
    """
    Determines whether the provided token belongs to a Client or BusinessSubject
    and returns the user's primary key (id) and type ('Client' or 'BusinessSubject').
    """
    # Retrieve the token from the Authorization header
    token = request.headers.get('Authorization')  # Expected format: "Token <your_token>"
    
    if not token:
        return Response({"error": "Authentication token required"}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        # Extract the actual token key from the "Token <token>" format
        token_key = token.split(' ')[1]  # Assumes "Token <token>"
        
        # Check if the token is for a Client
        try:
            client_token = ClientToken.objects.get(key=token_key)
            user = client_token.client  # Retrieve the associated user
            return Response({"id": user.pk, "type": "Client"}, status=status.HTTP_200_OK)
        except ClientToken.DoesNotExist:
            pass  # Token is not for a Client
        
        # Check if the token is for a BusinessSubject
        try:
            business_token = BusinessSubjectToken.objects.get(key=token_key)
            user = business_token.business_subject  # Retrieve the associated user
            return Response({"id": user.pk, "type": "BusinessSubject"}, status=status.HTTP_200_OK)
        except BusinessSubjectToken.DoesNotExist:
            pass  # Token is not for a BusinessSubject
        
        # If no token match is found, return an error
        return Response({"error": "Invalid token or token expired"}, status=status.HTTP_401_UNAUTHORIZED)

    except IndexError:
        return Response({"error": "Invalid token format"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_business_subject(request, pk):
    try:
        user = BusinessSubject.objects.get(pk=pk)
    except BusinessSubject.DoesNotExist:
        return Response({"error": "Business Subject not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = BusinessSubjectSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)




logger = logging.getLogger(__name__)

@api_view(["PUT"])
def edit_business_subject(request, pk):
    # Extract token from the Authorization header
    token = request.headers.get('Authorization')  # Format: "Bearer <your_token>"
    if not token:
        logger.error("Authentication failed: No token provided.")
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        token_key = token.split(' ')[1]  # Extract actual token key
        business_token = BusinessSubjectToken.objects.get(key=token_key)
        user = business_token.business_subject  # Associated user
    except BusinessSubjectToken.DoesNotExist:
        logger.error("Authentication failed: Invalid token or token expired.")
        return Response({"error": "Invalid token or token expired"}, status=status.HTTP_401_UNAUTHORIZED)

    # Verify the user is updating their own profile
    if user.pk != pk:
        logger.error(f"User {user.pk} attempted to edit another user's profile {pk}.")
        return Response({"error": "You can only edit your own profile"}, status=status.HTTP_403_FORBIDDEN)

    # Log request data
    logger.info(f"Request data for user {user.pk}: {request.data}")

    

    # Handle password change
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")
    if old_password and new_password and confirm_password:
        # Verify old password
        if not user.check_password(old_password):
            logger.error(f"Password update failed for user {user.pk}: Incorrect old password.")
            return Response({"error": "Old password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)
        if new_password != confirm_password:
            logger.error(f"Password update failed for user {user.pk}: Passwords do not match.")
            return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        logger.info(f"Password updated successfully for user {user.pk}.")

    # Handle profile picture
    if 'profile_picture' in request.FILES:
        user.profile_picture = request.FILES['profile_picture']
        logger.info(f"Profile picture updated for user {user.pk}.")

    # Save changes to user before serializing
    try:
        user.save()
        logger.info(f"User {user.pk} updated successfully: {user}.")
    except Exception as e:
        logger.error(f"Failed to save user {user.pk}: {e}")
        return Response({"error": "Failed to update user."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Now, update additional fields using the serializer
    try:
        business_subject = BusinessSubject.objects.get(pk=pk)
        serializer = BusinessSubjectSerializer(business_subject, data=request.data, partial=True)
        
        # Validate the serializer before saving the instance
        if serializer.is_valid():  # This is the point where you check if the serializer is valid
            serializer.save()
            logger.info(f"Business subject {pk} updated successfully in database.")
        else:
            logger.error(f"Validation failed for business subject {pk}: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except BusinessSubject.DoesNotExist:
        logger.error(f"Business subject with ID {pk} not found.")
        return Response({"error": "Business subject not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Failed to update business subject {pk}: {e}")
        return Response({"error": "Failed to update business subject."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Inspect the database after updates
    try:
        updated_bs = BusinessSubject.objects.get(pk=pk)
        logger.info(f"Database inspection: Updated business subject {updated_bs}.")
    except Exception as e:
        logger.error(f"Failed to fetch updated business subject {pk} from database: {e}")

    return Response({"message": "Business subject updated successfully."}, status=status.HTTP_200_OK)


@api_view(["POST"])
def activate_client(username):
    """
    Activates a Client profile by setting is_active to True.
    """
    try:
        client = Client.objects.get(username=username)
        if not client.is_active:
            client.is_active = True
            client.save()
            return {"success": True, "message": f"Client '{username}' activated successfully."}
        return {"success": False, "message": f"Client '{username}' is already active."}
    except ObjectDoesNotExist:
        return {"success": False, "message": f"Client '{username}' does not exist."}

@api_view(["POST"])
def deactivate_client(username):
    """
    Deactivates a Client profile by setting is_active to False.
    """
    try:
        client = Client.objects.get(username=username)
        if client.is_active:
            client.is_active = False
            client.save()
            return {"success": True, "message": f"Client '{username}' deactivated successfully."}
        return {"success": False, "message": f"Client '{username}' is already inactive."}
    except ObjectDoesNotExist:
        return {"success": False, "message": f"Client '{username}' does not exist."}

@api_view(["POST"])
def activate_business_subject(email):
    """
    Activates a BusinessSubject profile by setting is_active to True.
    """
    try:
        business_subject = BusinessSubject.objects.get(email=email)
        if not business_subject.is_active:
            business_subject.is_active = True
            business_subject.save()
            return {"success": True, "message": f"BusinessSubject '{email}' activated successfully."}
        return {"success": False, "message": f"BusinessSubject '{email}' is already active."}
    except ObjectDoesNotExist:
        return {"success": False, "message": f"BusinessSubject '{email}' does not exist."}

@api_view(["POST"])
def deactivate_business_subject(email):
    """
    Deactivates a BusinessSubject profile by setting is_active to False.
    """
    try:
        business_subject = BusinessSubject.objects.get(email=email)
        if business_subject.is_active:
            business_subject.is_active = False
            business_subject.save()
            return {"success": True, "message": f"BusinessSubject '{email}' deactivated successfully."}
        return {"success": False, "message": f"BusinessSubject '{email}' is already inactive."}
    except ObjectDoesNotExist:
        return {"success": False, "message": f"BusinessSubject '{email}' does not exist."}



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
        business_profile = serializer.save()

        return Response({
            "profile": BusinessSubjectSerializer(business_profile).data  # Return the user's profile data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def register_client(request):
    # Deserialize the incoming registration data
    serializer = ClientSerializer(data=request.data)
    
    if serializer.is_valid():
        # Save the user data and create the user profile
        client_profile = serializer.save() 

        return Response({
            "profile": ClientSerializer(client_profile).data  # Return the user's profile data
        }, status=status.HTTP_201_CREATED)
    
    # If the data isn't valid, return an error response
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Get logger for debugging
logger = logging.getLogger(__name__)

@api_view(["POST"])
def login_business_subject(request):
    try:
        # Get username and password from the request
        email = request.data.get("email")
        password = request.data.get("password")

        # Validate input
        if not email or not password:
            return Response({"error": "Email and password are required"}, status=400)

        # Use the custom authentication function to authenticate the user
        user = custom_authenticate_bs(email, password)

        if not user:
            logger.warning(f"Failed login attempt for email: {email}")
            return Response({"error": "Invalid credentials"}, status=400)

        # Check if the user is active
        if not user.is_active:
            return Response({"error": "Account is disabled"}, status=403)

        # Create or retrieve the token for the user (client or business subject)
        token, created = BusinessSubjectToken.objects.get_or_create(
            business_subject=user,  # Use 'user' here since both Client and BusinessSubject will be handled
            defaults={"key": get_random_string(40)}  # Assign a random token key if it's created
        )

        # Return the token
        return Response({"token": token.key}, status=200)

    except Exception as e:
        logger.error(f"Unexpected error during login for user '{email}': {str(e)}", exc_info=True)
        return Response({"error": "An unexpected error occurred"}, status=500)    







# Get logger for debugging
logger = logging.getLogger(__name__)

@api_view(["POST"])
def login_user(request):
    try:
        # Get username and password from the request
        username = request.data.get("username")
        password = request.data.get("password")

        # Validate input
        if not username or not password:
            return Response({"error": "Username and password are required"}, status=400)

        # Use the custom authentication function to authenticate the user
        user = custom_authenticate(username, password)

        if not user:
            logger.warning(f"Failed login attempt for username: {username}")
            return Response({"error": "Invalid credentials"}, status=400)

        # Check if the user is active
        if not user.is_active:
            return Response({"error": "Account is disabled"}, status=403)

        # Create or retrieve the token for the user (client or business subject)
        token, created = ClientToken.objects.get_or_create(
            client=user,  # Use 'user' here since both Client and BusinessSubject will be handled
            defaults={"key": get_random_string(40)}  # Assign a random token key if it's created
        )

        # Return the token
        return Response({"token": token.key}, status=200)

    except Exception as e:
        logger.error(f"Unexpected error during login for user '{username}': {str(e)}", exc_info=True)
        return Response({"error": "An unexpected error occurred"}, status=500)

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


def oauth2callback(request):
    # This function will handle the callback after OAuth authorization
    flow = InstalledAppFlow.from_client_secrets_file(
        'client_secret.json', SCOPES)
    creds = flow.fetch_token(authorization_response=request.build_absolute_uri())
    
    # Save the credentials for future use
    with open('token.json', 'wb') as token:
        pickle.dump(creds, token)

    return HttpResponse("OAuth2 callback handled successfully!")

# Define the required Gmail API scopes
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def send_email_via_gmail(to_email, subject, message):
    # Check if token.json exists and load credentials
    creds = None
    if os.path.exists('token.json'):
        with open('token.json', 'rb') as token:
            creds = pickle.load(token)

    # If there are no valid credentials, go through the OAuth flow to get new credentials
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'client_secret.json', SCOPES)
            creds = flow.run_local_server(port=8001)


        # Save the credentials for the next run
        with open('token.json', 'wb') as token:
            pickle.dump(creds, token)

    # Build the Gmail API service
    service = build('gmail', 'v1', credentials=creds)

    # Create the email content
    email_message = MIMEText(message)
    email_message['To'] = to_email
    email_message['Subject'] = subject
    raw_message = base64.urlsafe_b64encode(email_message.as_bytes()).decode()

    # Send the email
    try:
        message = (
            service.users()
            .messages()
            .send(userId="me", body={"raw": raw_message})
            .execute()
        )
        print(f"Email sent: {message['id']}")
        return True
    except Exception as error:
        print(f"An error occurred: {error}")
        return False

def generate_password_reset_link(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = PasswordResetTokenGenerator().make_token(user)
    return f"{settings.FRONTEND_URL}/resetpassword?uid={uid}&token={token}"

@api_view(['POST'])
def request_password_reset(request):
    # Get the username from the request data
    email = request.data.get('email')

    # Check in Client model
    try:
        # Check if the client exists by username
        client = Client.objects.get(email=email)
        # Generate the password reset link using the client instance
        reset_url = generate_password_reset_link(client)
        # Send the password reset email to the client's associated email
        send_email_via_gmail(
            to_email=client.email,
            subject="Password Reset Request",
            message=f"Click the link to reset your password: {reset_url}"
             # Send to the client's email
        )
        return Response({"message": "Password reset link sent successfully."}, status=200)

    except Client.DoesNotExist:
        pass  # Continue to check in BusinessSubject model

    # Check in BusinessSubject model
    try:
        # Check if the business subject exists by username
        business_subject = BusinessSubject.objects.get(email=email)
        # Generate the password reset link using the business subject instance
        reset_url = generate_password_reset_link(business_subject)
        # Send the password reset email to the business subject's associated email
        send_email_via_gmail(
            to_email=business_subject.email,
            subject="Password Reset Request",
            message=f"Click the link to reset your password: {reset_url}"
             # Send to the client's email
        )
        return Response({"message": "Password reset link sent successfully."}, status=200)

    except BusinessSubject.DoesNotExist:
        # If the username doesn't exist in either Client or BusinessSubject, return an error
        return Response({"error": "User with this username does not exist."}, status=400)



@api_view(['POST'])
def reset_password(request, uidb64, token):
    try:
        # Decode the UID from base64
        uid = urlsafe_base64_decode(uidb64).decode()

        # Attempt to find a matching Client
        try:
            user = Client.objects.get(pk=uid)
        except Client.DoesNotExist:
            # Attempt to find a matching BusinessSubject if not found in Client
            user = BusinessSubject.objects.get(pk=uid)

        # Validate the token
        if PasswordResetTokenGenerator().check_token(user, token):
            # Get the new password from the request data
            new_password = request.data.get('password')
            password_confirmation = request.data.get('password_confirmation')

            # Ensure the new password is provided and is confirmed
            if not new_password or not password_confirmation:
                return Response({"error": "Both password and confirmation are required."}, status=400)

            if new_password != password_confirmation:
                return Response({"error": "Password and confirmation do not match."}, status=400)

            

            # Update the password
            user.set_password(new_password)  # Ensure models use Django's UserManager
            user.save()
            return Response({"message": "Password reset successful."}, status=200)

        else:
            return Response({"error": "Invalid or expired token."}, status=400)

    except (Client.DoesNotExist, BusinessSubject.DoesNotExist, ValueError, TypeError):
        return Response({"error": "Invalid reset link."}, status=400)

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



@api_view(['GET'])
@permission_classes([AllowAny])  # Allow all users to access this endpoint
def search_users(request):

    logger.debug("Search users endpoint was hit")  # Add this log line
    query = request.GET.get('q', '').strip()  # Strip any leading/trailing whitespace
    
    if not query:
        return Response({"error": "Query parameter 'q' is required."}, status=status.HTTP_400_BAD_REQUEST)

    # Search for clients
    client_results = Client.objects.filter(
        Q(first_name__icontains=query) | 
        Q(last_name__icontains=query) |
        Q(username__icontains=query)  # Assuming you have a 'username' field for Client
    ).distinct()  # Avoid duplicate clients in case of multiple matches

    # Search for business profiles
    business_results = BusinessSubject.objects.filter(
        Q(business_name__icontains=query)
    ).distinct()  # Search businesses by company name

    # Serialize client results
    serialized_clients = []
    for client in client_results:
        client_data = ClientSerializer(client).data
        
        client_data['id'] = client.username
        
        # Add client data to the results
        serialized_clients.append(client_data)

    # Serialize client results
    serialized_business_profiles = []
    for business in business_results:
        business_data = BusinessSubjectSerializer(business).data
        
        business_data['id'] = business.business_name
        
        # Add client data to the results
        serialized_business_profiles.append(business_data)

    
    # Combine results
    result = {
        "clients": serialized_clients,
        "business_profiles": serialized_business_profiles
    }

    return Response(result, status=status.HTTP_200_OK)

# Function to get client data by username
def get_client_by_username(request, username):
    try:
        client = get_object_or_404(Client, username=username)  # Get client by username
        response_data = {
            'first_name': client.first_name,
            'last_name': client.last_name,
            'username': client.username,
            'email': client.email,
            'profile_picture': client.profile_picture.url if client.profile_picture else None
        }
        return JsonResponse(response_data, status=200)
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'Client not found'}, status=404)

@api_view(['GET'])
def get_business_by_name(request, business_name):
    try:
        # Get business by business_name
        business = get_object_or_404(BusinessSubject, business_name=business_name)
        
        # Serialize the business data
        serializer = BusinessSubjectSerializer(business)
        
        # Return the serialized data as JSON response
        return Response(serializer.data, status=200)
    
    except BusinessSubject.DoesNotExist:
        return JsonResponse({'error': 'Business not found'}, status=404)    

@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_clients(request):
    """
    List all registered clients. Accessible only to admin users.
    """
    clients = Client.objects.all()
    serializer = ClientSerializer(clients, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_client_favorite_fields(request, user_id):
    try:
        user = Client.objects.get(id=user_id)
        favorite_fields = user.favorite_fields.all()
        serializer = FieldSerializer(favorite_fields, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Client.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
def get_business_subject_favorite_fields(request, business_id):
    try:
        business_subject = BusinessSubject.objects.get(id=business_id)
        favorite_fields = business_subject.favorite_fields.all()
        serializer = FieldSerializer(favorite_fields, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except BusinessSubject.DoesNotExist:
        return Response({"error": "Business subject not found."}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['POST'])
def update_client_favorite_fields(request, user_id):
    try:
        client = Client.objects.get(id=user_id)
    except Client.DoesNotExist:
        return Response({"detail": "Client not found."}, status=status.HTTP_404_NOT_FOUND)

    field_id = request.data.get('field_id')
    action = request.data.get('action')

    if not field_id or not action or action not in ['add', 'remove']:
        return Response({"detail": "Invalid input. Action must be 'add' or 'remove', and field_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        field = Field.objects.get(id=field_id)
        
        if action == 'add':
            client.favorite_fields.add(field)
        elif action == 'remove':
            client.favorite_fields.remove(field)
        
        client.save()
        return Response({"detail": "Successfully updated favorite fields."}, status=status.HTTP_200_OK)
    
    except Field.DoesNotExist:
        return Response({"detail": "Field not found."}, status=status.HTTP_404_NOT_FOUND)
    

@api_view(['POST'])
def update_business_subject_favorite_fields(request, business_id):
    try:
        business_subject = BusinessSubject.objects.get(id=business_id)
    except BusinessSubject.DoesNotExist:
        return Response({"detail": "Business subject not found."}, status=status.HTTP_404_NOT_FOUND)

    field_id = request.data.get('field_id')
    action = request.data.get('action')

    if not field_id or not action or action not in ['add', 'remove']:
        return Response({"detail": "Invalid input. Action must be 'add' or 'remove', and field_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        field = Field.objects.get(id=field_id)
        
        if action == 'add':
            business_subject.favorite_fields.add(field)
        elif action == 'remove':
            business_subject.favorite_fields.remove(field)
        
        business_subject.save()
        return Response({"detail": "Successfully updated favorite fields."}, status=status.HTTP_200_OK)
    
    except Field.DoesNotExist:
        return Response({"detail": "Field not found."}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
def get_username_by_id(request, pk):
    """
    Fetches the username of a Client based on their ID.
    """
    try:
        client = Client.objects.get(pk=pk)  # Dohvata klijenta po ID-u
        return Response({"username": client.username}, status=status.HTTP_200_OK)
    except Client.DoesNotExist:
        return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)

