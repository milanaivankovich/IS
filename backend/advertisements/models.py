from django.db import models

class Advertisement(models.Model):
    id = models.AutoField(primary_key=True)
    description = models.CharField(max_length=200)
    date = models.DateField()
    business_subject = models.ForeignKey('accounts.BusinessSubject', on_delete=models.CASCADE, null=True)
    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.description