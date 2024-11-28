from django.urls import reverse_lazy
from django.views.generic.edit import CreateView
from .models import Aktivnost
from rest_framework.response import Response
from rest_framework.decorators import api_view
from accounts.models import Client
from .serializers import AktivnostSerializer
from rest_framework import status
from django.shortcuts import get_object_or_404, render

class AktivnostCreateView(CreateView):
    model = Aktivnost
    fields = ['naziv', 'opis']
    template_name = 'activities/aktivnost_form.html'    
    success_url = reverse_lazy('aktivnost-success')

@api_view(['GET'])
def client_activities(request, client_id):      
    #client = Client.objects.get(id=client_id)
    client=get_object_or_404(Client, id=client_id)
    #aktivnosti = client.activities.all()
    #data = [{"name": a.name, "descritption": a.descritption, } for a in aktivnosti]
    aktivnosti = Aktivnost.objects.filter(client=client)
    serializer = AktivnostSerializer(aktivnosti, many=True)
    #return Response(data)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
def add_activity(request, client_id):
    client = get_object_or_404(Client, id=client_id)
    data = request.data.copy()
    data['client'] = client.id
    seriallizer = AktivnostSerializer(data=data)
    if seriallizer.is_valid():
        seriallizer.save()
        return Response(seriallizer.data, status=status.HTTP_201_CRETATED)
    return Response(seriallizer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_client_activities(request, client_id):
    client = get_object_or_404(Client, id=client_id)
    aktivnosti = Aktivnost.objects.filter(client=client)
    serializer = AktivnostSerializer(aktivnosti, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def activities_by_date(request, datum):
    aktivnosti = Aktivnost.objects.filter(datum=datum)
    if aktivnosti.exists():
        serializer = AktivnostSerializer(aktivnosti, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({'error': 'No activities found for this date'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def activities_by_location(request, teren):
    aktivnosti = Aktivnost.objects.filter(teren__icontains=teren)
    if aktivnosti.exists():
        serializer = AktivnostSerializer(aktivnosti, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({'error': 'No activities found for this location'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def activities_by_date_and_location(request, datum, teren):
    aktivnosti = Aktivnost.objects.filter(datum=datum, teren__icontains=teren)
    if aktivnosti.exists():
        serializer = AktivnostSerializer(aktivnosti, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({'error': 'No activities found for this date and location'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_all_activities(request):
    aktivnosti = Aktivnost.objects.all()
    serializer = AktivnostSerializer(aktivnosti, many = True)
    return Response(serializer.data,status=status.HTTP_200_OK)

