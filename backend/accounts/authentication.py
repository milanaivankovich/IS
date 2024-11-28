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
    

    # Return None if no matching client or business subject found
    return None

logger = logging.getLogger(__name__)

def custom_authenticate_bs(email, password):
    try:
        # Look for BusinessSubject
        business_subject = BusinessSubject.objects.filter(email=email).first()
        if not business_subject:
            logger.warning(f"No BusinessSubject found for email: {email}")
            return None

        # Check if the password matches
        if check_password(password, business_subject.password):
            logger.info(f"Password matched for email: {email}")
            return business_subject
        else:
            logger.warning(f"Password mismatch for email: {email}")

    except Exception as e:
        logger.error(f"Error during authentication for email {email}: {str(e)}", exc_info=True)

    # Return None if authentication fails
    return None