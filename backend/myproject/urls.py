# myproject/urls.py
from django.urls import path, include, re_path
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import SimpleRouter
from push_notifications.api.rest_framework import WebPushDeviceViewSet

api_router = SimpleRouter()
api_router.register(r'push/web', WebPushDeviceViewSet, basename='web_push')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('accounts.urls')),  # Make sure this line is included
    path('', include('activities.urls')), #aktivnosti = za slucaj da ne bude radilo
    path('', include('fields.urls')),
    path('', include('reviews.urls')),
    path('', include('advertisements.urls')),
    path('', include('chat.urls')),
    path('', include('notifications.urls')),
    re_path('api/webpush/', include(api_router.urls)),
    #path('webpush/', include('webpush.urls'))
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
