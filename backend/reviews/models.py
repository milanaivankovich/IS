from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Review(models.Model):
    id = models.AutoField(primary_key=True)
    rating = models.IntegerField(validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ])
    description = models.CharField(max_length=200)
    client = models.ForeignKey('accounts.Client', on_delete=models.CASCADE, null=True)
    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.description
