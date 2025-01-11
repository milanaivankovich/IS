from django.db import models
from accounts.models import Client
from django.core.exceptions import ValidationError
from django.utils.timezone import localtime

class Activities(models.Model):
    id = models.AutoField(primary_key=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='activities')
    titel = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)   
    date = models.DateTimeField()
    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, null=True)
    NumberOfParticipants = models.IntegerField(null=True)
    sport = models.ForeignKey('fields.Sport', on_delete=models.CASCADE, null=True)
    is_deleted = models.BooleanField(default=False)
    participants = models.ManyToManyField(Client, related_name='activities_participated', blank=True)
    #participants = models.ManyToManyField(Client, related_name='joined_activities')
    """ def clean(self):
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
 """
    def clean(self):
        if self.date is None:
            raise ValidationError("Datum ne može biti prazan.")
        if self.field and self.field.is_suspended:
            raise ValidationError('Teren je suspendovan.')
        if self.NumberOfParticipants is not None and self.NumberOfParticipants < 0:
            raise ValidationError("Broj učesnika ne može biti negativan.")
        super().clean()

    def register_participant(self):
        """Smanjuje broj učesnika za 1 ako su mesta dostupna."""
        if self.NumberOfParticipants <= 0:
            raise ValidationError("Nema više dostupnih mesta za ovu aktivnost.")
        self.NumberOfParticipants -= 1
        self.save()

    def __str__(self):
        formatted_date = localtime(self.date).strftime('%Y-%m-%d %H:%M:%S') if self.date else "N/A"
        return f"{self.titel} - {formatted_date}"
