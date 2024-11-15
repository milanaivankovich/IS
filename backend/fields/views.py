from rest_framework.response import Response # type: ignore
from rest_framework.decorators import api_view # type: ignore
from .models import Field
from .serializers import FieldSerializer
from rest_framework.views import APIView # type: ignore

@api_view(['GET'])
def getData(request):
    fields = Field.objects.all()
    serializer = FieldSerializer(fields, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def setData(request):
    serializer = FieldSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
    return Response(serializer.data)