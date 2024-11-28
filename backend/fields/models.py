from django.db import models 

class Field(models.Model):
    id = models.AutoField(primary_key=True)
    location = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    type_of_sport = models.CharField(max_length=255)
    is_suspended = models.BooleanField(default=False)
    image = models.ImageField(upload_to='./images/', null=True, blank=True)

    def __str__(self):
        return self.location
