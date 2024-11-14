from django.urls import path
from .views import AktivnostCreateView

urlpatterns = [
    path('dodaj/', AktivnostCreateView.as_view(), name='dodaj-aktivnost'),
]