from rest_framework.response import Response 
from rest_framework.decorators import api_view 
from .models import Advertisement
from .serializers import AdvertisementSerializer

@api_view(['GET'])
def getData(request):
    advertisements = Advertisement.objects.all()
    serializer = AdvertisementSerializer(advertisements, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def setData(request):
    serializer = AdvertisementSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
    return Response(serializer.data)

@api_view(['GET'])
def advertisements_by_date(request, date):
    advertisements = Advertisement.objects.filter(date=date)
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
    advertisements = Advertisement.objects.filter(date=date, field__location__icontains=location)
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
def get_sport_by_field_id(request, field_id):
    from fields.models import Field
    try:
        field = Field.objects.get(id=field_id)
        return Response({'type_of_sport': field.type_of_sport})
    except Field.DoesNotExist:
        return Response({'error': 'Field not found'}, status=404)