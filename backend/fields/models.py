from django.db import models 

class Sport(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
class Field(models.Model):
    id = models.AutoField(primary_key=True)
    location = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    sports = models.ManyToManyField(Sport, related_name='fields')
    is_suspended = models.BooleanField(default=False)
    image = models.ImageField(upload_to='./images/', null=True, blank=True)

    def __str__(self):
        return self.location
