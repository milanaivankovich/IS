from django.contrib.auth.models import AnonymousUser
from urllib.parse import parse_qs
import logging
from channels.middleware import BaseMiddleware
from accounts.authentication import custom_authenticate  # Import your custom function

logger = logging.getLogger(__name__)

class CustomAuthMiddleware(BaseMiddleware):
    """Middleware to authenticate WebSocket connections using custom authentication."""

    async def __call__(self, scope, receive, send):
        query_string = parse_qs(scope["query_string"].decode())  # Extract query parameters
        
        # Get credentials from WebSocket request (e.g., ws://localhost:8000/ws/chat/?username=USER&password=PASS)
        username = query_string.get("username", [None])[0]
        password = query_string.get("password", [None])[0]

        if username and password:
            user = custom_authenticate(username, password)  # Authenticate user
            if user:
                logger.info(f"WebSocket authentication successful for user: {username}")
                scope["user"] = user
            else:
                logger.warning(f"WebSocket authentication failed for user: {username}")
                scope["user"] = AnonymousUser()  # Fallback to anonymous user
        else:
            logger.warning("WebSocket connection without credentials")
            scope["user"] = AnonymousUser()  # No credentials provided

        return await super().__call__(scope, receive, send)  # Pass request forward
