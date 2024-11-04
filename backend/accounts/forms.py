
from django import forms
from django.contrib.auth.models import User
from .models import StandardUserProfile, ClientProfile, BusinessProfile

class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'password', 'email']

class StandardUserProfileForm(forms.ModelForm):
    class Meta:
        model = StandardUserProfile
        fields = ['phone']

class ClientProfileForm(forms.ModelForm):
    class Meta:
        model = ClientProfile
        fields = ['address']

class BusinessProfileForm(forms.ModelForm):
    class Meta:
        model = BusinessProfile
        fields = ['business_name', 'tax_id']
