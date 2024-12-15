from rest_framework.response import Response 
from rest_framework.decorators import api_view 
from .models import Advertisement
from .serializers import AdvertisementSerializer
from django.db.models.functions import TruncDate
from fields.models import Field, Sport   
from accounts.models import BusinessSubject

@api_view(['GET'])
def getData(request):
    advertisements = Advertisement.objects.all()
    serializer = AdvertisementSerializer(advertisements, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def setData(request):
    print("Received data:", request.data)  # Provjerite što dolazi u zahtjevu
    try:
        # Provjerite ako su polja prisutna u request.data
        if 'field' not in request.data or 'sport' not in request.data:
            return Response({'error': 'Missing required fields: field or sport'}, status=400)

        field = Field.objects.get(id=request.data['field'])
        sport = Sport.objects.get(id=request.data['sport'])
    except KeyError as e:
        return Response({'error': f'Missing field: {str(e)}'}, status=400)
    except Field.DoesNotExist:
        return Response({'error': 'Field not found'}, status=400)
    except Sport.DoesNotExist:
        return Response({'error': 'Sport not found'}, status=400)

    serializer = AdvertisementSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    else:
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=400)


@api_view(['GET'])
def advertisements_by_date(request, date):
    advertisements = Advertisement.objects.annotate(date_only=TruncDate('date')).filter(date_only=date)
    if advertisements.exists():
        serializer = AdvertisementSerializer(advertisements, many=True)
        return Response(serializer.data)
    else:
        return Response({'error': 'No advertisements found for this date'}, status=404)


@api_view(['GET'])
def advertisements_by_location(request, location):
    advertisements = Advertisement.objects.filter(field__location__icontains=location)
    if advertisements.exists():
        serializer = AdvertisementSerializer(advertisements, many=True)
        return Response(serializer.data)
    else:
        return Response({'error': 'No advertisements found for this location'}, status=404)
    

@api_view(['GET'])
def advertisements_by_date_and_location(request, date, location):
    advertisements = Advertisement.objects.annotate(date_only=TruncDate('date')) \
                                           .filter(date_only=date, field__location__icontains=location)
    if advertisements.exists():
        serializer = AdvertisementSerializer(advertisements, many=True)
        return Response(serializer.data)
    else:
        return Response({'error': 'No advertisements found for this date and location'}, status=404)


@api_view(['GET'])
def get_location_by_field_id(request, field_id):
    from fields.models import Field
    try:
        field = Field.objects.get(id=field_id)
        return Response({'location': field.location})
    except Field.DoesNotExist:
        return Response({'error': 'Field not found'}, status=404)
    

@api_view(['GET'])
def get_business_subject_by_id(request, business_subject_id):
    from accounts.models import BusinessSubject
    try:
        name = BusinessSubject.objects.get(id=business_subject_id)
        return Response({'business_name': name.business_name})
    except BusinessSubject.DoesNotExist:
        return Response({'error': 'Field not found'}, status=404)
    
@api_view(['GET'])
def get_sports_by_field_id(request, field_id):
    from fields.models import Field, Sport
    from advertisements.models import Advertisement

    try:
        field = Field.objects.get(id=field_id)
        advertisements = Advertisement.objects.filter(field=field)
        sports = Sport.objects.filter(fields=field).distinct()
        sports_list = [sport.name for sport in sports]
        return Response({'sports': sports_list})
    except Field.DoesNotExist:
        return Response({'error': 'Field not found'}, status=404)
    
@api_view(['GET'])
def get_advertisement_by_id(request, id):
    try:
        advertisements = Advertisement.objects.filter(id=id)
        serializer = AdvertisementSerializer(advertisements, many=True)
        return Response(serializer.data)
    except Field.DoesNotExist:
        return Response(status=404)
    
@api_view(['GET'])
def get_advertisements_by_business_subject(request, business_subject_id):
    advertisements = Advertisement.objects.filter(business_subject=business_subject_id)
    if advertisements.exists():
        serializer = AdvertisementSerializer(advertisements, many=True)
        return Response(serializer.data)
    else:
        return Response({'error': 'No advertisements found for this business subject'}, status=404)
