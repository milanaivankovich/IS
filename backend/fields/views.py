from rest_framework.response import Response 
from rest_framework.decorators import api_view 
from .models import Field, Sport
from .serializers import FieldSerializer
from rest_framework.views import APIView
from rest_framework import status
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

@api_view(['GET'])
def getData(request):
    fields = Field.objects.filter(is_suspended=False)
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
    
@api_view(['GET'])
def get_sport_name(request, sport_id):
    try:
        sport = Sport.objects.get(id=sport_id)
        return Response({'sports': sport.name})
    except Sport.DoesNotExist:
        return Response({'error': 'Field not found'}, status=404)
