from django.db import models

class Comment(models.Model):
  id = models.AutoField(primary_key=True)
  date = models.DateTimeField(auto_now_add=True, null=True)
  client = models.ForeignKey('accounts.Client', on_delete=models.CASCADE, null=True)
  activity = models.ForeignKey('activities.Activities', on_delete=models.CASCADE, null=True)
  text = models.TextField(blank=True, null=True)

  def __str__(self):
        return self.text