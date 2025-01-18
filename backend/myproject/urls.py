# myproject/urls.py
from django.urls import path, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('accounts.urls')),  # Make sure this line is included
    path('', include('activities.urls')), #aktivnosti = za slucaj da ne bude radilo
    path('', include('fields.urls')),
    path('', include('reviews.urls')),
    path('', include('advertisements.urls')),
    path('', include('comments.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
