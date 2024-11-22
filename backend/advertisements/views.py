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