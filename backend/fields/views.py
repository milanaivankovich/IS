from rest_framework.response import Response 
from rest_framework.decorators import api_view 
from .models import Field, Sport
from activities.models import Activities
from accounts.models import Client
from django.db.models import Count, Q, Case, When, Value, CharField
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from datetime import timedelta
from django.contrib.auth.models import User
from activities.models import Activities 
from accounts.models import Client
from .serializers import FieldSerializer, SportSerializer
from rest_framework.views import APIView
from rest_framework import status
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .management.commands.generate_random_fields import create_fields  # Import the create_fields function

@api_view(['GET'])
def getData(request):
    fields = Field.objects.filter(is_suspended=False)
    serializer = FieldSerializer(fields, context={'request': request}, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def setData(request):
    serializer = FieldSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
    return Response(serializer.data)

@api_view(['GET'])
def fields_by_location(request, location):
    try:
        fields = Field.objects.filter(location=location)
        serializer = FieldSerializer(fields, many=True)
        return Response(serializer.data)
    except Field.DoesNotExist:
        return Response(status=404)
    
@api_view(['GET'])
def get_sport_name(request, sport_id):
    try:
        sport = Sport.objects.get(id=sport_id)
        return Response({'sports': sport.name})
    except Sport.DoesNotExist:
        return Response({'error': 'Field not found'}, status=404)
    
@api_view(['GET'])
def get_sport_id(request, sport_name):
    try:
        sport = Sport.objects.get(name=sport_name)
        return Response({'sports': sport.id})
    except Sport.DoesNotExist:
        return Response({'error': 'Field not found'}, status=404)
    
@api_view(['GET'])
def getSports(request):
    sports = Sport.objects.filter()
    serializer = SportSerializer(sports, context={'request': request}, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def field_sports(request, field_id):
    try:
        field = Field.objects.get(id=field_id)
        sports = field.sports.all()
        serializer = SportSerializer(sports, many=True)
        return Response({"sports": serializer.data})
    except Field.DoesNotExist:
        return Response(status=404)
    
@api_view(['GET'])
def field_by_id(request, id):
    try:
        field = Field.objects.get(id=id)  
        serializer = FieldSerializer(field) 
        return Response(serializer.data)
    except Field.DoesNotExist:
        return Response({"error": "Field not found"}, status=status.HTTP_404_NOT_FOUND)
    

# Funkcija koja generiše podatke
@api_view(['GET'])
def generate_random_fields(request):
    # Pozivanje funkcije za generisanje podataka
    create_fields()  # Pozivaš funkciju koju smo prethodno kreirali za generisanje terena

    # Dobijanje svih terena u JSON formatu
    fields = Field.objects.all()
    serializer = FieldSerializer(fields, many=True)

    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_analytics(request, username):
    try:
        # Get the client object
        client = Client.objects.get(username=username)
        
        # Verify request user matches the requested username or is admin
        if request.user.username != username and not request.user.is_staff:
            return Response(
                {'error': 'Not authorized to view this data'}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        # 1. Favorite sport calculation
        sport_stats = Activities.objects.filter(
            Q(client=client) | Q(participants=client)
        ).values('sport__name').annotate(
            total=Count('id'),
            created=Count('id', filter=Q(client=client)),
            participated=Count('id', filter=Q(participants=client))
        ).order_by('-total')
        
        favorite_sport = sport_stats.first()['sport__name'] if sport_stats else None
        
        # 2. Created activities by sport
        created_by_sport = Activities.objects.filter(
            client=client
        ).values('sport__name').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # 3. Participated activities by sport
        participated_by_sport = Activities.objects.filter(
            participants=client
        ).values('sport__name').annotate(
            count=Count('id')
        ).order_by('-count')
        
        response_data = {
            'favorite_sport': favorite_sport,
            'created_by_sport': list(created_by_sport),
            'participated_by_sport': list(participated_by_sport),
            'total_created': Activities.objects.filter(client=client).count(),
            'total_participated': Activities.objects.filter(participants=client).count(),
        }
        
        return Response(response_data)
        
    except Client.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )