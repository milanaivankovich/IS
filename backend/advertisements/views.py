from rest_framework.response import Response 
from rest_framework.decorators import api_view 
from .models import Advertisement
from .serializers import AdvertisementSerializer
from django.db.models.functions import TruncDate
from django.utils.timezone import now
from fields.models import Field, Sport   
from accounts.models import BusinessSubject
from datetime import datetime

@api_view(['GET'])
def getData(request):
    now = datetime.now()
    advertisements = Advertisement.objects.filter(
        is_deleted=False,
        date__gt=now
    )
    serializer = AdvertisementSerializer(advertisements, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def setData(request):
    print("Received data:", request.data) 
    try:
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
    advertisements = Advertisement.objects.annotate(date_only=TruncDate('date')).filter(date_only=date, is_deleted=False, date__gt=now())
    if advertisements.exists():
        serializer = AdvertisementSerializer(advertisements, many=True)
        return Response(serializer.data)
    else:
        return Response({'error': 'No advertisements found for this date'}, status=404)


@api_view(['GET'])
def advertisements_by_location(request, location):
    advertisements = Advertisement.objects.filter(field__location__icontains=location, is_deleted=False, date__gt=now())
    if advertisements.exists():
        serializer = AdvertisementSerializer(advertisements, many=True)
        return Response(serializer.data)
    else:
        return Response({'error': 'No advertisements found for this location'}, status=404)
    

@api_view(['GET'])
def advertisements_by_date_and_location(request, date, location):
    advertisements = Advertisement.objects.annotate(date_only=TruncDate('date')) \
                                           .filter(date_only=date, field__location__icontains=location, is_deleted=False, date__gt=now())
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
        return Response({
            'location': field.location,
            'precise_location': field.precise_location
        })
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
        advertisements = Advertisement.objects.filter(field=field, is_deleted=False)
        sports = Sport.objects.filter(fields=field).distinct()
        sports_list = [sport.name for sport in sports]
        return Response({'sports': sports_list})
    except Field.DoesNotExist:
        return Response({'error': 'Field not found'}, status=404)
    
@api_view(['GET'])
def get_advertisement_by_id(request, id):
    try:
        advertisements = Advertisement.objects.filter(id=id, is_deleted=False)
        serializer = AdvertisementSerializer(advertisements, many=True)
        return Response(serializer.data)
    except Field.DoesNotExist:
        return Response(status=404)
    
    
@api_view(['GET'])
def get_advertisements_by_business_subject(request, business_name):
    now = datetime.now()

    try:
        business_subject = BusinessSubject.objects.get(business_name=business_name)
    except BusinessSubject.DoesNotExist:
        return Response({'error': 'Business subject not found'}, status=404)
    
    advertisements = Advertisement.objects.filter(
        business_subject=business_subject,
        is_deleted=False,
        date__gt=now
    )
    
    if advertisements.exists():
        serializer = AdvertisementSerializer(advertisements, many=True)
        return Response(serializer.data)
    else:
        return Response({'error': 'No advertisements found for this business subject'}, status=404)
    
    
@api_view(['GET'])
def advertisements_by_field(request, field):
    try:
        reviews = Advertisement.objects.filter(field=field, is_deleted=False, date__gt=now())
        serializer = AdvertisementSerializer(reviews, many=True)
        return Response(serializer.data)
    except Advertisement.DoesNotExist:
        return Response(status=404)


@api_view(['PUT'])
def update_advertisement(request, pk):
    try:
        advertisement = Advertisement.objects.get(pk=pk, is_deleted=False)
    except Advertisement.DoesNotExist:
        return Response({'error': 'Advertisement not found'}, status=404)

    serializer = AdvertisementSerializer(advertisement, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=200)
    else:
        return Response(serializer.errors, status=400)
    

@api_view(['DELETE'])
def delete_advertisement(request, pk):
    try:
        advertisement = Advertisement.objects.get(pk=pk, is_deleted=False)
    except Advertisement.DoesNotExist:
        return Response({'error': 'Advertisement not found'}, status=404)

    advertisement.is_deleted = True
    advertisement.save()
    return Response({'message': 'Advertisement marked as deleted'}, status=200)

@api_view(['GET'])
def get_past_advertisements_by_business_subject(request, business_name):
    now = datetime.now()

    try:
        business_subject = BusinessSubject.objects.get(business_name=business_name)
    except BusinessSubject.DoesNotExist:
        return Response({'error': 'Business subject not found'}, status=404)
    
    advertisements = Advertisement.objects.filter(
        business_subject=business_subject,
        is_deleted=False,
        date__lt=now
    )
    
    if advertisements.exists():
        serializer = AdvertisementSerializer(advertisements, many=True)
        return Response(serializer.data)
    else:
        return Response({'error': 'No advertisements found for this business subject'}, status=404)