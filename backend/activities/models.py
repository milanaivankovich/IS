from django.db import models
from accounts.models import Client

#dodati opciju za teren 
class Activities(models.Model):
    id=models.AutoField(primary_key=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='activities', null=True)
    titel = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    #datum_kreiranja = models.DateTimeField(auto_now_add=True)
    date = models.DateField(null=True)
    #vrijeme = models.TimeField(null=True)
    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, null=True)
    NumberOfParticipants = models.IntegerField(null=True)

    def __str__(self):
        return self.description   
    
    