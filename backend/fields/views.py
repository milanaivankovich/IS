from rest_framework.response import Response # type: ignore
from rest_framework.decorators import api_view # type: ignore
from .models import Field
from .serializers import FieldSerializer
from rest_framework.views import APIView # type: ignore

class FieldSearchView(APIView):
    def get(self, request, *args, **kwargs):
        location = request.query_params.get('lokacija')
        fields = Field.objects.filter(location__icontains=location)
        serializer = FieldSerializer(fields, many=True)
        return Response(serializer.data)