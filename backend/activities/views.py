from django.urls import reverse_lazy
from django.views.generic.edit import CreateView
from .models import Aktivnost

class AktivnostCreateView(CreateView):
    model = Aktivnost
    fields = ['naziv', 'opis']
    template_name = 'activities/aktivnost_form.html'
    success_url = reverse_lazy('aktivnost-success')