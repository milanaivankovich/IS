from rest_framework import viewsets
from .models import StandardUser, BusinessSubject, Client
from .serializers import StandardUserSerializer, BusinessSubjectSerializer, ClientSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView


class StandardUserViewSet(viewsets.ModelViewSet):
    queryset = StandardUser.objects.all()
    serializer_class = StandardUserSerializer
    permission_classes = [IsAuthenticated]

class BusinessSubjectViewSet(viewsets.ModelViewSet):
    queryset = BusinessSubject.objects.all()
    serializer_class = BusinessSubjectSerializer
    permission_classes = [IsAuthenticated]

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]

class UserRegistrationView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)