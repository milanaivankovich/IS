from django.db import models

class Advertisement(models.Model):
    id = models.AutoField(primary_key=True)
    description = models.CharField(max_length=200)
    date = models.CharField(max_length=100)

    def __str__(self):
        return self.description