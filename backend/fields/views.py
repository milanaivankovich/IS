from rest_framework.response import Response 
from rest_framework.decorators import api_view 
from .models import Field
from .serializers import FieldSerializer
from rest_framework.views import APIView
from rest_framework import status


@api_view(['GET'])
def getData(request):
    fields = Field.objects.all()
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
    

