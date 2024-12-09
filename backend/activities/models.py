from django.db import models
from accounts.models import Client
from django.core.exceptions import ValidationError


class Activities(models.Model):
    id=models.AutoField(primary_key=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='activities', null=True)
    titel = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    date = models.DateField(null=True)
    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, null=True)
    NumberOfParticipants = models.IntegerField(null=True)
    sport = models.ForeignKey('fields.Sport', on_delete=models.CASCADE, null=True)

    def clean(self):
        if self.field and self.field.is_suspended:
            raise ValidationError('Aktivnost se ne može povezati s terenom jer je teren suspendovan.')
        sports_on_teren = self.field.sports.all()
        if self.sport not in sports_on_teren:
            raise ValidationError(f"Sport '{self.sport.name}' nije dostupan na terenu '{self.field.location}'.")

        super().clean()

    def __str__(self):
        return self.description   
    
    