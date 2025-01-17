from rest_framework.response import Response # type: ignore
from rest_framework.decorators import api_view # type: ignore
from rest_framework import status
from .models import Review
from django.shortcuts import get_object_or_404
from .serializers import ReviewSerializer
from accounts.models import Client

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

@api_view(['GET'])
def reviews_by_field(request, field):
    try:
        reviews = Review.objects.filter(field=field)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    except Review.DoesNotExist:
        return Response(status=404)
    
@api_view(['POST'])
def update_liked_by(request, review_id):
    try:
        review = get_object_or_404(Review, id=review_id)
        client_id = request.data.get('client_id')
        if not client_id:
            return Response({"error": "Client ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        client = get_object_or_404(Client, id=client_id)
        
        if review.liked_by.filter(id=client.id).exists():
            return Response({"message": "Client already liked this review"}, status=status.HTTP_200_OK)
        
        review.liked_by.add(client)
        review.save()
        
        return Response({"message": "Client added to liked_by successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def remove_from_liked_by(request, review_id):
    try:
        review = get_object_or_404(Review, id=review_id)
        client_id = request.data.get('client_id')
        if not client_id:
            return Response({"error": "Client ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        client = get_object_or_404(Client, id=client_id)
        
        if not review.liked_by.filter(id=client.id).exists():
            return Response({"message": "Client has not liked this review"}, status=status.HTTP_200_OK)
        
        review.liked_by.remove(client)
        review.save()
        
        return Response({"message": "Client removed from liked_by successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)