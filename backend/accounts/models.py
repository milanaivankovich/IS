from django.db import models
from django.contrib.auth.models import AbstractUser

class Client(AbstractUser):
    # Additional fields specific to Client
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to="profile_pics/", blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    # Provide custom related_name to avoid clashes
    groups = models.ManyToManyField(
        'auth.Group',
        related_name="client_groups",  # Custom related name
        blank=True,
        help_text="The groups this user belongs to.",
        verbose_name="groups",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name="client_user_permissions",  # Custom related name
        blank=True,
        help_text="Specific permissions for this user.",
        verbose_name="user permissions",
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class BusinessSubject(AbstractUser):
    # Remove `first_name` and `last_name` by setting them to None
    first_name = None
    last_name = None
    username = None

    # Business-specific fields
    business_name = models.CharField(max_length=255, unique=True)
    profile_picture = models.ImageField(upload_to="business_pics/", blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    # Custom related_name to avoid clashes
    groups = models.ManyToManyField(
        'auth.Group',
        related_name="business_subject_groups",  # Custom related name
        blank=True,
        help_text="The groups this user belongs to.",
        verbose_name="groups",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name="business_subject_user_permissions",  # Custom related name
        blank=True,
        help_text="Specific permissions for this user.",
        verbose_name="user permissions",
    )

    def __str__(self):
        return self.business_name
