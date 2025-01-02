from django.db import models
from accounts.models import Client
from django.core.exceptions import ValidationError
from django.utils.timezone import now, localtime

class Activities(models.Model):
    id=models.AutoField(primary_key=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='activities', null=True)
    titel = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)   
    #date = models.DateField(null=True)
    date = models.DateTimeField()
    #date = models.DateTimeField(default=now, null=True)
    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, null=True)
    NumberOfParticipants = models.IntegerField(null=True)
    sport = models.ForeignKey('fields.Sport', on_delete=models.CASCADE, null=True)
    is_deleted = models.BooleanField(default=False)
    
    #def __str__(self):
    #    formatted_date = localtime(self.date).strftime('%Y-%m-%d %H:%M:%S') if self.date else "N/A"
    #    return f"{self.titel} - {formatted_date}"

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
        

    def register_participant(self):
        """Smanjuje broj ucesnika za 1 ako su mjesta dostupna."""
        if self.NumberOfParticipants <= 0:
            raise ValidationError("Nema vise dostupnih mjesta za ovu aktivnost.")
        self.NumberOfParticipants -= 1
        self.save()

    def __str__(self):
        client_username = self.client.username if self.client else "No client"
        return self.description   
    
    
    
def __str__(self):
    formatted_date = localtime(self.date).strftime('%Y-%m-%d %H:%M:%S') if self.date else "N/A"
    return f"{self.titel} - {formatted_date}"