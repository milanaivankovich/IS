from django.db import models
from django.core.exceptions import ValidationError

class Advertisement(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, null=True)
    description = models.CharField(max_length=200)
    date = models.DateTimeField()
    business_subject = models.ForeignKey('accounts.BusinessSubject', on_delete=models.CASCADE, null=True)
    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, null=True)
    sport = models.ForeignKey('fields.Sport', on_delete=models.CASCADE, null=True)
    is_deleted = models.BooleanField(default=False)
    duration_hours = models.IntegerField(null=False, default=0)

    def clean(self):
        if self.field and self.field.is_suspended:
            raise ValidationError('Oglas se ne može povezati s terenom jer je teren suspendovan.')
        
        sports_on_teren = self.field.sports.all()
        if self.sport not in sports_on_teren:
            raise ValidationError(f"Sport '{self.sport.name}' nije dostupan na terenu '{self.field.location}'.")

        super().clean()

    def __str__(self):
        return self.description