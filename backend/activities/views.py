from django.urls import reverse_lazy
from django.views.generic.edit import CreateView
from .models import Activities
from rest_framework.response import Response
from rest_framework.decorators import api_view
from accounts.models import Client
from .serializers import ActivitiesSerializer
from rest_framework import status
from django.shortcuts import get_object_or_404
from datetime import datetime
from django.core.exceptions import ValidationError
from django.db.models.functions import TruncDate
from django.utils.timezone import now
from datetime import datetime

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

#@api_view(['GET'])
#def activities_by_date(request, date):
    # Validacija formata datuma
 #   try:
   #     valid_date = datetime.strptime(date, "%Y-%m-%d").date()
  #  except ValueError:
 #       return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)
  #  
  #  activities = Activities.objects.filter(date=valid_date)
   # if activities.exists():
   #     serializer = ActivitiesSerializer(activities, many=True)
   #     return Response(serializer.data)

  #  return Response({'error': 'No activities found for this date'}, status=404)

#@api_view(['GET'])
#def activities_by_date(request, date):
#    activities = Activities.objects.filter(datum=date)
#    if activities.exists():
#        serializer = ActivitiesSerializer(activities, many = True)
#        return Response(serializer.data)
#    return Response({'error': 'No activities found for this date'}, status=404)


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
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from .models import Activities
from django.contrib.auth.models import User

from rest_framework.authtoken.models import Token
import logging
from django.utils.crypto import get_random_string
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .models import ClientToken

logger = logging.getLogger(__name__)


@api_view(["POST"])
def login_user(request):
    try:
        username = request.data.get("username")
        password = request.data.get("password")

        # Validacija ulaznih podataka
        if not username or not password:
            return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Autentifikacija korisnika
        user = authenticate(username=username, password=password)

        if not user:
            logger.warning(f"Neuspešan pokušaj prijave za korisnika: {username}")
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_active:
            return Response({"error": "Account is disabled"}, status=status.HTTP_403_FORBIDDEN)

        # Kreiraj ili preuzmi token za korisnika
        token, created = ClientToken.objects.get_or_create(
            client=user,
            defaults={"key": get_random_string(40)}
        )

        return Response({"token": token.key}, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Neočekivana greška tokom prijave korisnika '{username}': {str(e)}", exc_info=True)
        return Response({"error": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def register_to_activity(request, activity_id):
    activity = get_object_or_404(Activities, id=activity_id)

    # Dohvatanje tokena iz zaglavlja
    token = request.headers.get('Authorization')
    if not token or not token.startswith("Bearer "):
        return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    token_key = token.split(' ')[1]

    try:
        # Validacija tokena
        client_token = ClientToken.objects.get(key=token_key)
        user = client_token.client
    except ClientToken.DoesNotExist:
        return Response({"error": "Invalid token."}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        activity.register_participant(user)
        return Response(
            {"message": "Successfully registered for the activity!", "remaining_slots": activity.NumberOfParticipants},
            status=status.HTTP_200_OK
        )
    except ValidationError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def check_user_registration(request, activity_id, username):
    """
    Proverava da li je korisnik registrovan na aktivnost.
    """
    activity = get_object_or_404(Activities, id=activity_id)
    user = get_object_or_404(User, username=username)

    if activity.registered_users.filter(id=user.id).exists():
        return Response({"registered": True}, status=status.HTTP_200_OK)
    return Response({"registered": False}, status=status.HTTP_200_OK)

    
@api_view(['GET'])
def activities_by_username(request, username):
    """
    Pretražuje aktivnosti na osnovu username-a korisnika.
    """
    activities = Activities.objects.filter(client__username__icontains=username)
    if activities.exists():
        serializer = ActivitiesSerializer(activities, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({'error': 'No activities found for this username'}, status=status.HTTP_404_NOT_FOUND)

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
