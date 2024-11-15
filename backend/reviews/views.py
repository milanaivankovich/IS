from rest_framework.response import Response # type: ignore
from rest_framework.decorators import api_view # type: ignore
from .models import Review
from .serializers import ReviewSerializer

@api_view(['GET'])
def getData(request):
    reviews = Review.objects.all()
    serializer = ReviewSerializer(reviews, many=True)   
    return Response(serializer.data)

@api_view(['POST'])
def setData(request):
    serializer = ReviewSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
    return Response(serializer.data)
