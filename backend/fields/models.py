from django.db import models # type: ignore

# Create your models here.
class Field(models.Model):
    id = models.AutoField(primary_key=True)
    location = models.CharField(max_length=255)
    type_of_sport = models.CharField(max_length=255)
    is_suspended = models.BooleanField(default=False)

    def __str__(self):
        return self.location
