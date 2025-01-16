from django.db import models, transaction
from accounts.models import Client
from django.core.exceptions import ValidationError
from django.utils.timezone import localtime
from django.utils.timezone import now

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
    
    def clean(self):
        if self.date is None:
            raise ValidationError("Datum ne može biti prazan.")
        if self.field and self.field.is_suspended:
            raise ValidationError('Teren je suspendovan.')
        if self.NumberOfParticipants is not None and self.NumberOfParticipants < 0:
            raise ValidationError("Broj učesnika ne može biti negativan.")
        super().clean()
    @transaction.atomic
    def register_participant(self, user):
        """
        Registrira učesnika na aktivnost, uz validaciju dostupnosti mesta i duplikata.
        """
        if user in self.participants.all():
            raise ValidationError("Korisnik je već prijavljen na ovu aktivnost.")

        if self.NumberOfParticipants is not None and self.participants.count() >= self.NumberOfParticipants:
            raise ValidationError("Nema slobodnih mesta.")

        print(f"Aktualan broj učesnika: {self.participants.count()}")
        print(f"Maksimalan broj učesnika: {self.NumberOfParticipants}")
        self.participants.add(user)
        self.save()

    @transaction.atomic
    def unregister_participant(self, user):
        """
        Odjavljuje učesnika sa aktivnosti, uz validaciju datuma i duplikata.
        """
        if user not in self.participants.all():
            raise ValidationError("Korisnik nije prijavljen na ovu aktivnost.")

        if self.date <= now():
            raise ValidationError("Ne možete se odjaviti sa aktivnosti koja je već počela.")
        print(f"Aktualan broj učesnika nakon odjave: {self.participants.count()}")
        self.participants.remove(user)
        self.save()
    def __str__(self):
        formatted_date = localtime(self.date).strftime('%Y-%m-%d %H:%M:%S') if self.date else "N/A"
        return f"{self.titel} - {formatted_date}"
