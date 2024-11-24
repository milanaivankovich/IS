from django.contrib.auth.hashers import check_password
from accounts.models import Client, BusinessSubject
import logging

logger = logging.getLogger(__name__)

def custom_authenticate(username, password):
    # Try to find the user in the Client model first
    client = Client.objects.filter(username=username).first()
    if client:
        # Check if the password matches for Client
        if check_password(password, client.password):
            return client
    
    # If not found in Client model, try BusinessSubject
    business_subject = BusinessSubject.objects.filter(username=username).first()
    if business_subject:
        # Check if the password matches for BusinessSubject
        if check_password(password, business_subject.password):
            return business_subject

    # Return None if no matching client or business subject found
    return None
