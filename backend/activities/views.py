from django.urls import reverse_lazy
from django.views.generic.edit import CreateView
from .models import Activities
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from accounts.models import Client
from .serializers import ActivitiesSerializer
from rest_framework import status
from django.shortcuts import get_object_or_404, render
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

@api_view(['GET'])
def getData(request):
    activiti = Activities.objects.filter(is_deleted=False)  # Prikaz svih aktivnosti
    serializer = ActivitiesSerializer(activiti, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def setData(request):
    serializer = ActivitiesSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        print(serializer.errors)  # Ovo će ispisati greške u konzoli
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def client_activities(request, client_id):
    client = Client.objects.get(id=client_id)
    activities = client.activities.all()
    data = [{"name": a.name, "descritption": a.descritption, } for a in activities]
    return Response(data)

@api_view(['POST'])
def add_activity(request, client_id):
    client = get_object_or_404(Client, id=client_id)

    # Kopiramo podatke iz request-a i postavljamo 'client'
    data = request.data.copy()
    data['client'] = client.id

    serializer = ActivitiesSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_client_activities(request, client_id):
    now = datetime.now()
    activities = Activities.objects.filter(
        client_id=client_id,
        is_deleted=False,
        date__gte=now  # Dohvata sve aktivnosti od sadašnjeg trenutka nadalje
        
    )
    print(f"Broj aktivnosti za klijenta {client_id}: {activities.count()}")
    if activities.exists():
        serializer = ActivitiesSerializer(activities, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Nema dostupnih aktivnosti za ovog korisnika.'}, status=status.HTTP_404_NOT_FOUND)

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
    activity = get_object_or_404(Activities, id=activity_id)
    username = request.data.get('username') 

    if not username:
        return Response({'error': 'Nedostaje korisničko ime.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = Client.objects.get(username=username)
    except Client.DoesNotExist:
        return Response({'error': 'Korisnik nije pronađen.'}, status=status.HTTP_404_NOT_FOUND)

    # Provera da li je korisnik kreator aktivnosti preko username-a
    if activity.client.username == username:  # Poređenje username-a kreatora i prijavljenog korisnika
        return Response({'error': 'Ne možete se prijaviti na svoju aktivnost.'}, status=status.HTTP_400_BAD_REQUEST)

    # Provera da li je korisnik već prijavljen
    if user in activity.participants.all():
        return Response({'error': 'Već ste prijavljeni na ovu aktivnost.'}, status=status.HTTP_400_BAD_REQUEST)

    # Provera da li ima slobodnih mesta
    if activity.NumberOfParticipants is not None and activity.participants.count() >= activity.NumberOfParticipants:
        return Response({'error': 'Nema slobodnih mesta.'}, status=status.HTTP_400_BAD_REQUEST)

    # Dodavanje korisnika u učesnike
    activity.participants.add(user)
    activity.save()
    print(f"Korisnik '{username}' je uspešno prijavljen na aktivnost '{activity.titel}'.")

    remaining_slots = activity.NumberOfParticipants - activity.participants.count() if activity.NumberOfParticipants else None
    print(f"Slobodnih mjesta: {remaining_slots}")
    return Response(
        {'message': 'Uspješno ste se prijavili na aktivnost!', 'remaining_slots': remaining_slots},
        status=status.HTTP_200_OK
    )

@api_view(['POST'])
def unregister_activity(request, activity_id):
    """
    Odjava korisnika sa aktivnosti.
    """
    username = request.data.get('username')

    if not username:
        return Response({'error': 'Nedostaje korisničko ime.'}, status=status.HTTP_400_BAD_REQUEST)

    user = get_object_or_404(Client, username=username)
    activity = get_object_or_404(Activities, id=activity_id)

    # Provjera i uklanjanje korisnika
    try:
        activity.unregister_participant(user)
        remaining_slots = activity.NumberOfParticipants - activity.participants.count() if activity.NumberOfParticipants else None
        print(f"Slobodnih mjesta: {remaining_slots}")
        print(f"Korisnik '{username}' je uspešno odjavljen sa aktivnosti '{activity.titel}'.")

        return Response({
            "message": "Uspešno ste se odjavili sa aktivnosti.",
            "activity_removed": True,  # Dodano kako bi frontend mogao znati da je aktivnost uklonjena
            "remaining_slots": activity.NumberOfParticipants
        }, status=status.HTTP_200_OK)
    except ValidationError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


def get_registered_activities(user):
    """
    Dohvata aktivnosti na koje je korisnik prijavljen.
    """
    from django.utils.timezone import now
    return Activities.objects.filter(participants=user, date__gte=now).distinct()

def user_profile(request):
    user = request.user
    created_activities = Activities.objects.filter(client=user, is_deleted=False)
    joined_activities = Activities.objects.filter(participants=user, is_deleted=False).exclude(client=user)
    
    # Dohvati učesnike za svaku kreiranu aktivnos
    activities_with_participants = {
        activity: activity.participants.all().values_list('username', flat=True)
        for activity in created_activities
    }
    return render(request, 'profile.html', {
        'created_activities': created_activities,
        'joined_activities': joined_activities,
    })

@api_view(['GET'])
def get_registered_events(request, username):
    """
    Prikazuje aktivnosti na koje se korisnik prijavio.
    """
    try:
        user = Client.objects.get(username=username)
    except Client.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    # Filtriramo aktivnosti u kojima je korisnik učesnik, ali nije kreator
    registered_events = Activities.objects.filter(participants=user).exclude(client=user).distinct()

    if registered_events.exists():
        serializer = ActivitiesSerializer(registered_events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response({'error': 'No registered events found for this user'}, status=status.HTTP_404_NOT_FOUND)


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
def activity_participants(request, activity_id):
    """
    Prikazuje korisnička imena svih učesnika prijavljenih na datu aktivnost.
    Dostupno svim korisnicima.
    """
    # Dohvati aktivnost
    activity = get_object_or_404(Activities, id=activity_id)

    # Prikupljanje korisničkih imena učesnika
    participants = activity.participants.all().values_list('username', flat=True)
    print(f"Učesnici aktivnosti {activity_id}: {list(participants)}")
    # Vraća JSON sa korisničkim imenima učesnika
    return Response({'participants': list(participants)}, status=status.HTTP_200_OK)


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
    
    # Aktivnosti koje je korisnik kreirao
    created_events = Activities.objects.filter(client=user, is_deleted=False)
    created_serializer = ActivitiesSerializer(created_events, many=True)

    # Aktivnosti na koje se korisnik prijavio
    registered_events = Activities.objects.filter(participants=user).exclude(client=user).distinct()
    registered_serializer = ActivitiesSerializer(registered_events, many=True)

    # Kombinovani odgovor
    return Response({
        'created_events': created_serializer.data,
        'registered_events': registered_serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['DELETE'])
def delete_activity(request, pk):
    """
    Soft delete za aktivnost (označava je kao obrisanu)
    """
    try:
        # Pronađi aktivnost koja nije obrisana
        activity = Activities.objects.get(pk=pk, is_deleted=False)
    except Activities.DoesNotExist:
        return Response({'error': 'Activity not found'}, status=404)

    # Označavanje aktivnosti kao obrisane
    activity.is_deleted = True
    activity.save()

    return Response({'message': 'Activity marked as deleted'}, status=200)
