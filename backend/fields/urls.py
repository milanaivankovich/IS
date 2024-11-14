from django.urls import path # type: ignore
from .views import FieldSearchView

urlpatterns = [
    path('teren/search/', FieldSearchView.as_view(), name='teren-search'),
]