from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError

class Review(models.Model):
    id = models.AutoField(primary_key=True)
    rating = models.IntegerField(validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ])
    description = models.CharField(max_length=200)
    client = models.ForeignKey('accounts.Client', on_delete=models.CASCADE, null=True)
    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, null=True)

    def clean(self):
        if self.field and self.field.is_suspended:
            raise ValidationError('Recenzija se ne može povezati s terenom jer je teren suspendovan.')

    def __str__(self):
        return self.description
