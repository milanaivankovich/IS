"""
ASGI config for myproject project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from accounts.middleware import CustomAuthMiddleware  # Import the custom middleware
import chat.routing
import notifications.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")

# Django ASGI application
django_asgi_app = get_asgi_application()

# WebSocket application with custom authentication middleware
application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": CustomAuthMiddleware(  # Replace AuthMiddlewareStack
            URLRouter(
                chat.routing.websocket_urlpatterns
                + notifications.routing.websocket_urlpatterns
            )
        ),
    }
)
