from rest_framework.response import Response # type: ignore
from rest_framework.decorators import api_view # type: ignore
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