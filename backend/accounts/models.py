from django.db import models
from django.contrib.auth.models import AbstractUser

# Extend Django's default User model for extra flexibility
class StandardUser(AbstractUser):
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    


    groups = models.ManyToManyField(
        'auth.Group',
        related_name="standard_user_set",  # Custom related name
        blank=True,
        help_text="The groups this user belongs to.",
        verbose_name="groups",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name="standard_user_permissions_set",  # Custom related name
        blank=True,
        help_text="Specific permissions for this user.",
        verbose_name="user permissions",
    )

class BusinessSubject(models.Model):
    user = models.OneToOneField(StandardUser, on_delete=models.CASCADE, related_name="business_profile")
    password = models.CharField(max_length=128, default='temporary_password')


    business_name = models.CharField(max_length=255, blank=True, null=True)
    registration_number = models.CharField(max_length=50, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)

class Client(models.Model):
    user = models.OneToOneField(StandardUser, on_delete=models.CASCADE, related_name="client_profile")
    


    # Additional optional fields
    date_of_birth = models.DateField(blank=True, null=True)   # Optional
    profile_picture = models.ImageField(upload_to="profile_pics/", blank=True, null=True)  # Optional
    bio = models.TextField(blank=True, null=True)             # Optional

    def __str__(self):
        return f"{self.first_name} {self.last_name}" 