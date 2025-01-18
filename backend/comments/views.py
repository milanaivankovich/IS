from django.shortcuts import render
from .models import Comment
from .serializers import CommentSerializer
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def getData(request):
    comments = Comment.objects.all()
    serializer = CommentSerializer(comments, many=True)   
    return Response(serializer.data)

@api_view(['POST'])
def setData(request):
    serializer = CommentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
    return Response(serializer.data)

@api_view(['GET'])
def comments_by_activity(request, activity):
    try:
        comments = Comment.objects.filter(activity=activity)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)
    except Comment.DoesNotExist:
        return Response(status=404)