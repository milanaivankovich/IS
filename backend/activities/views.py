from django.urls import reverse_lazy
from django.views.generic.edit import CreateView
from .models import Activities
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from accounts.models import Client
from .serializers import ActivitiesSerializer
from rest_framework import status
from django.shortcuts import get_object_or_404
from datetime import datetime
from django.core.exceptions import ValidationError
from django.db.models.functions import TruncDate
from django.utils.timezone import now
from datetime import datetime
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone


class ActivitiesCreateView(CreateView):
    model = Activities
    fields = ['titel', 'description']
    template_name = 'activities/aktivnost_form.html'    
    success_url = reverse_lazy('aktivnost-success')

#@api_view(['GET'])
#def getData(request):
#    activities = Activities.objects.all()
#    serializer = ActivitiesSerializer(activities, many=True)
#    return Response(serializer.data)

@api_view(['GET'])
def getData(request):
    now = datetime.now()
    activiti = Activities.objects.filter(
        is_deleted=False,
        date__gt=now
    )
    serializer = ActivitiesSerializer(activiti, many=True)
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
  #  client = get_object_or_404(Client, id=client_id)
   # activities = Activities.objects.filter(client=client)
  #  serializer = ActivitiesSerializer(activities, many=True)
  #  return Response(serializer.data, status=status.HTTP_200_OK)
    now = datetime.now()

    activities = Activities.objects.filter(
        client_id = client_id,
        is_deleted = False,
        date__gt = now
    )

    if activities.exists():
        serializer = ActivitiesSerializer(activities, many=True)
        return Response(serializer.data)
    else:
        return Response({'error': 'No advertisements found for this business subject'}, status=404)
    



@api_view(['GET'])
def activities_by_date(request, date):
    try:
        valid_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

    activities = Activities.objects.filter(is_deleted=False, date__gt=now())
    activities = [a for a in activities if a.date.date() == valid_date]

    if activities:
        serializer = ActivitiesSerializer(activities, many=True)
        return Response(serializer.data)
    else:
        return Response({'error': 'No advertisements found for this date'}, status=404)

@api_view(['GET'])
def activities_by_location(request, location):
    activities = Activities.objects.filter(field__location__icontains=location, is_deleted=False, date__gt=now())
    if activities.exists():
        serializer = ActivitiesSerializer(activities, many=True)
        return Response(serializer.data)
    return Response({'error': 'No activities found for this location'}, status=404)



@api_view(['GET'])
def activities_by_date_and_location(request, date, location):
    try:
        # Validate the date format
        valid_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

    # Fetch activities and filter further in Python
    activities = Activities.objects.filter(is_deleted=False, date__gt=now())
    filtered_activities = [
        a for a in activities
        if a.date.date() == valid_date and location.lower() in a.field.location.lower()
    ]

    if filtered_activities:
        serializer = ActivitiesSerializer(filtered_activities, many=True)
        return Response(serializer.data)
    else:
        return Response({'error': 'No activities found for this date and location.'}, status=404)

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
    try:
        activities = Activities.objects.get(activity_id = activity_id, is_deleted=False)
    except Activities.DoesNotExist:
        return Response({'error': 'Advertisement not found'}, status=404)

    serializer = ActivitiesSerializer(activities, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=200)
    else:
        return Response(serializer.errors, status=400)


@api_view(['GET'])
def get_type_of_sport_by_field_id(request, field_id):
    from fields.models import Field
    try:
        field = Field.objects.get(id=field_id)
        return Response({'type_of_sport': field.type_of_sport})
    except Field.DoesNotExist:
        return Response({'error': 'Field not found'}, status=404)
    
@api_view(['POST'])
def register_to_activity(request, activity_id):
    """
    Registruje korisnika na aktivnost ako ima slobodnih mesta
    i ako nije već prijavljen.
    """
    activity = get_object_or_404(Activities, id=activity_id)

    # Parsiranje korisničkih podataka iz tela zahteva
    username = request.data.get('username')  # Dobijamo username iz requesta

    if not username:
        return Response({'error': 'Nedostaje korisničko ime.'}, status=status.HTTP_400_BAD_REQUEST)

    # Provera da li je korisnik već prijavljen
    if activity.client and activity.client.username == username:
        return Response({'error': 'Već ste prijavljeni na ovu aktivnost.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        activity.register_participant()  # Smanjuje broj učesnika
        activity.client = Client.objects.get(username=username)  # Povezuje korisnika sa aktivnošću
        activity.save()
        return Response(
            {'message': 'Uspješno ste se prijavili na aktivnost!', 'remaining_slots': activity.NumberOfParticipants},
            status=status.HTTP_200_OK
        )
    except ValidationError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


#@api_view(['GET'])
#@permission_classes([IsAuthenticated])
#def get_registered_events(request):
#    """
#    Vraća događaje na koje je prijavljen trenutni korisnik.
#    """
#    user = request.user
#    registered_events = Activities.objects.filter(participants=user).exclude(creator=user)  # Događaji gde je učesnik, ali nije kreator
#    serializer = ActivitiesSerializer(registered_events, many=True)
#    return Response(serializer.data)
from django.shortcuts import render
from .models import Activities

def get_registered_activities(user):
    """
    Dohvata aktivnosti na koje je korisnik prijavljen.
    """
    from django.utils.timezone import now
    return Activities.objects.filter(participants=user, date__gte=now).distinct()

def user_profile(request):
    """
    Prikaz profila korisnika i njegovih aktivnosti.
    """
    user = request.user
    registered_activities = get_registered_activities(user)
    return render(request, 'profile.html', {'registered_activities': registered_activities})
from django.http import JsonResponse

@api_view(['GET'])
def get_registered_events(request, username):
    """
    Prikazuje aktivnosti na koje se korisnik prijavio.
    """
    try:
        user = Client.objects.get(username=username)
    except Client.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    #registered_events = Activities.objects.filter(participants=user).exclude(client=user).distinct()
    registered_events = Activities.objects.filter(participants__username=username)
    return JsonResponse({
        "registered_events": list(registered_events.values())
    })
    if registered_events.exists():
        serializer = ActivitiesSerializer(registered_events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({'error': 'No registered events found for this user'}, status=status.HTTP_404_NOT_FOUND)

#@api_view(['GET'])
#def activities_by_username(request, username):
#    """
#    Pretražuje aktivnosti na osnovu username-a korisnika.
#    """
#    activities = Activities.objects.filter(client__username__icontains=username)
#    if activities.exists():
#        serializer = ActivitiesSerializer(activities, many=True)
#        return Response(serializer.data, status=status.HTTP_200_OK)
#    return Response({'error': 'No activities found for this username'}, status=status.HTTP_404_NOT_FOUND)
@api_view(['GET'])
def activities_by_username(request, username):
    """
    Prikazuje aktivnosti koje je korisnik kreirao.
    """
    activities = Activities.objects.filter(client__username=username, is_deleted=False)
    if activities.exists():
        serializer = ActivitiesSerializer(activities, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({'error': 'No activities found created by this user'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def activities_by_field(request, field_id):
    """
    Filtrira aktivnosti na osnovu ID-a terena.
    """
    activities = Activities.objects.filter(field_id=field_id, is_deleted=False, date__gt=now())
    if activities.exists():
        serializer = ActivitiesSerializer(activities, many=True)
        return Response(serializer.data, status=200)
    else:
        return Response({'error': 'No activities found for this field.'}, status=404)


@api_view(['GET'])
def get_event_history(request, username):
    """
    Prikazuje istoriju aktivnosti na koje se korisnik prijavio.
    """
    try:
        user = Client.objects.get(username=username)
    except Client.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    # Filtriraj aktivnosti na koje se korisnik prijavio i koje su završene (npr. datum < sadašnji datum)
    now = timezone.now()
    past_events = Activities.objects.filter(participants=user, date__lt=now).distinct()
    
    if past_events.exists():
        serializer = ActivitiesSerializer(past_events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({'error': 'No past events found for this user'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_user_events(request, username):
    """
    Prikazuje aktivnosti koje je korisnik kreirao i na koje se prijavio.
    """
    try:
        user = Client.objects.get(username=username)
    except Client.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Događaji koje je korisnik kreirao
    created_events = Activities.objects.filter(client=user, is_deleted=False)
    created_serializer = ActivitiesSerializer(created_events, many=True)

    # Događaji na koje se korisnik prijavio
    registered_events = Activities.objects.filter(participants=user).exclude(client=user).distinct()
    registered_serializer = ActivitiesSerializer(registered_events, many=True)

    # Kombinovani odgovor
    return Response({
        'created_events': created_serializer.data,
        'registered_events': registered_serializer.data
    }, status=status.HTTP_200_OK)
