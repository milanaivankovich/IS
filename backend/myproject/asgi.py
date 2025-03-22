import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")
django.setup()  # Ensure Django is initialized before imports

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from accounts.middleware import CustomAuthMiddleware
import chat.routing
import notifications.routing

# Django ASGI application
django_asgi_app = get_asgi_application()

# WebSocket application with custom authentication middleware
application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": CustomAuthMiddleware(
            URLRouter(
                chat.routing.websocket_urlpatterns
                + notifications.routing.websocket_urlpatterns
            )
        ),
    }
)
