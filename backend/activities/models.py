from django.db import models
from accounts.models import Client


class Activities(models.Model):
    id=models.AutoField(primary_key=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='activities', null=True)
    titel = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    date = models.DateField(null=True)
    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, null=True)
    NumberOfParticipants = models.IntegerField(null=True)
    sport = models.ForeignKey('fields.Sport', on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.description   
    
    