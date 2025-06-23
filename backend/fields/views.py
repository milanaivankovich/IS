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
        # Proverite da li zahtev dolazi od istog korisnika
        if request.user.username != username:
            return Response({'error': 'Not authorized to view this data'}, status=403)
            
        # Debug ispis
        print(f"User making request: {request.user.username}")
        print(f"Requested user data: {username}")
  
        print(f"Starting analytics for user: {username}")  # Debug
        user = User.objects.get(username=username)
        print(f"User found: {user.id}")  # Debug
        
        # 1. Ukupan broj aktivnosti
        total_query = Activities.objects.filter(
            Q(creator__username=username) | Q(participants__user__username=username)
        ).distinct()
        print(f"Total activities query: {total_query.query}")  # Debug SQL
        total_participated = total_query.count()
        print(f"Total activities count: {total_participated}")  # Debug
        
        # 2. Kreirane aktivnosti
        created_query = Activities.objects.filter(creator__username=username)
        print(f"Created activities query: {created_query.query}")  # Debug SQL
        created_activities = created_query.count()
        print(f"Created activities count: {created_activities}")  # Debug
        
        # 3. Prijavljene aktivnosti
        registered_query = Activities.objects.filter(
            participants__user__username=username
        ).exclude(creator__username=username)
        print(f"Registered activities query: {registered_query.query}")  # Debug SQL
        registered_activities = registered_query.count()
        print(f"Registered activities count: {registered_activities}")  # Debug
        
        # 4. Raspodela po sportovima
        sport_distribution = Activities.objects.filter(
            Q(creator__username=username) | Q(participants__user__username=username)
        ).values('sport__name').annotate(
            count=Count('id'),
            created=Count(Case(When(creator__username=username, then=1))),
            registered=Count(Case(When(participants__user__username=username, then=1)))
        ).order_by('-count')
        
        print(f"Sport distribution raw: {list(sport_distribution)}")  # Debug
        
        sport_data = []
        for item in sport_distribution:
            sport_data.append({
                'sport': item['sport__name'] or 'Nepoznat sport',
                'total': item['count'],
                'created': item['created'],
                'registered': item['registered']
            })
        
        print(f"Sport data prepared: {sport_data}")  # Debug
        
        # 5. Mesečne statistike
        last_month = timezone.now() - timedelta(days=30)
        monthly_stats = Activities.objects.filter(
            Q(creator__username=username) | Q(participants__user__username=username),
            date__gte=last_month
        ).aggregate(
            total=Count('id'),
            created=Count(Case(When(creator__username=username, then=1))),
            registered=Count(Case(When(participants__user__username=username, then=1)))
        )
        
        print(f"Monthly stats: {monthly_stats}")  # Debug
        
        average_per_week = round(monthly_stats['total'] / 4.33, 1) if monthly_stats['total'] > 0 else 0
        
        response_data = {
            'total_participated': total_participated,
            'created_activities': created_activities,
            'registered_activities': registered_activities,
            'sport_distribution': sport_data,
            'monthly_stats': monthly_stats,
            'average_per_week': average_per_week
        }
        
        print(f"Final response data: {response_data}")  # Debug
        return Response(response_data)
        
    except User.DoesNotExist:
        print(f"User {username} not found")  # Debug
        return Response({'error': 'User not found'}, status=404)
    except Exception as e:
        print(f"Error in user_analytics: {str(e)}")  # Debug
        return Response({'error': str(e)}, status=400)