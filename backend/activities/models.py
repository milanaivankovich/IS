from django.db import models

class Aktivnost(models.Model):
    naziv = models.CharField(max_length=255)
    opis = models.TextField(blank=True, null=True)
    datum_kreiranja = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.naziv