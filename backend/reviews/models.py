from django.db import models

class Review(models.Model):
    id = models.AutoField(primary_key=True)
    rating = models.IntegerField()
    description = models.CharField(max_length=200)

    def __str__(self):
        return self.description
