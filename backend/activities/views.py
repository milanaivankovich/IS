from django.urls import reverse_lazy
from django.views.generic.edit import CreateView
from .models import Activities
from rest_framework.response import Response
from rest_framework.decorators import api_view
from accounts.models import Client
from .serializers import ActivitiesSerializer
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from datetime import datetime


class ActivitiesCreateView(CreateView):
    model = Activities
    fields = ['titel', 'description']
    template_name = 'activities/aktivnost_form.html'    
    success_url = reverse_lazy('aktivnost-success')

@api_view(['GET'])
def getData(request):
    activities = Activities.objects.all()
    serializer = ActivitiesSerializer(activities, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def setData(request):
    serializer = ActivitiesSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
    return Response(serializer.data)


@api_view(['GET'])
def client_activities(request, client_id):
    client = Client.objects.get(id=client_id)
    activities = client.activities.all()
    data = [{"name": a.name, "descritption": a.descritption, } for a in activities]
    return Response(data)

@api_view(['POST'])
def add_activity(request, client_id):
    client = get_object_or_404(Client, id=client_id)
    data = request.data.copy()
    data['client'] = client.id
    seriallizer = ActivitiesSerializer(data=data)    
    if seriallizer.is_valid():
        seriallizer.save()
        return Response(seriallizer.data, status=status.HTTP_201_CREATED)
    return Response(seriallizer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_client_activities(request, client_id):
    client = get_object_or_404(Client, id=client_id)
    activities = Activities.objects.filter(client=client)
    serializer = ActivitiesSerializer(activities, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def activities_by_date(request, date):
    # Validacija formata datuma
    try:
        valid_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)
    
    activities = Activities.objects.filter(date=valid_date)
    if activities.exists():
        serializer = ActivitiesSerializer(activities, many=True)
        return Response(serializer.data)

    return Response({'error': 'No activities found for this date'}, status=404)

#@api_view(['GET'])
#def activities_by_date(request, date):
#    activities = Activities.objects.filter(datum=date)
#    if activities.exists():
#        serializer = ActivitiesSerializer(activities, many = True)
#        return Response(serializer.data)
#    return Response({'error': 'No activities found for this date'}, status=404)


@api_view(['GET'])
def activities_by_location(request, location):
    activities = Activities.objects.filter(field__location__icontains=location)
    if activities.exists():
        serializer = ActivitiesSerializer(activities, many=True)
        return Response(serializer.data)
    return Response({'error': 'No activities found for this location'}, status=404)

@api_view(['GET'])
def activities_by_date_and_location(request, date, location):
    activities = Activities.objects.filter(date = date, field__location__icontains=location)
    if activities.exists():
        serializer = ActivitiesSerializer(activities, many = True)
        return Response(serializer.data)
    return Response({'error': 'No activities found for this date and location'}, status=404)

@api_view(['GET'])
def get_location_by_field_id(request, field_id):
    from fields.models import Field
    try:
        field = Field.objects.get(id=field_id)
        return Response({'location': field.location})
    except Field.DoesNotExist:
        return Response({'error': 'Field not found'}, status=404)
    
@api_view(['PUT'])
def update_activity(request, activity_id):
    activities = get_object_or_404(Activities, id=activity_id)
    serializer = ActivitiesSerializer(activities, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_type_of_sport_by_field_id(request, field_id):
    from fields.models import Field
    try:
        field = Field.objects.get(id=field_id)
        return Response({'type_of_sport': field.type_of_sport})
    except Field.DoesNotExist:
        return Response({'error': 'Field not found'}, status=404)
