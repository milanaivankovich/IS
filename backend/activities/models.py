from django.db import models
from accounts.models import Client
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils.timezone import now, localtime
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from django.db import models
from django.utils.crypto import get_random_string
from django.contrib.auth.models import User
from django.utils.timezone import now


class ClientToken(models.Model):
    client = models.OneToOneField(
        User,  # Ili prilagođeni model korisnika ako ga koristiš
        on_delete=models.CASCADE,
        related_name='client_auth_token'
    )
    key = models.CharField(max_length=40, unique=True, default=get_random_string)
    created = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = get_random_string(40)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Token for User {self.client.username}"


class Activities(models.Model):
    id = models.AutoField(primary_key=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='activities', null=True)
    titel = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    date = models.DateTimeField()
    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, null=True)
    NumberOfParticipants = models.IntegerField(null=True)
    sport = models.ForeignKey('fields.Sport', on_delete=models.CASCADE, null=True)
    is_deleted = models.BooleanField(default=False)
    registered_users = models.ManyToManyField(User, blank=True, related_name='registered_activities')

    def clean(self):
        if self.date is None:
            raise ValidationError("Datum ne može biti prazan.")
        if self.field and self.field.is_suspended:
            raise ValidationError('Aktivnost se ne može povezati s terenom jer je teren suspendovan.')
        sports_on_teren = self.field.sports.all()
        if self.sport not in sports_on_teren:
            raise ValidationError(f"Sport '{self.sport.name}' nije dostupan na terenu '{self.field.location}'.")
        if self.NumberOfParticipants is not None and self.NumberOfParticipants < 0:
            raise ValidationError("Broj učesnika ne može biti negativan.")
        super().clean()

    def register_participant(self, user):
        """Registruje korisnika na aktivnost ako ima slobodnih mesta."""
        if self.NumberOfParticipants <= 0:
            raise ValidationError("Nema više dostupnih mesta za ovu aktivnost.")
        if self.registered_users.filter(id=user.id).exists():
            raise ValidationError("Već ste prijavljeni na ovu aktivnost.")
        self.registered_users.add(user)
        self.NumberOfParticipants -= 1
        self.save()

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
