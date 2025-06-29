# views.py
from django.contrib.auth import authenticate, login, logout
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication
from django.views.decorators.csrf import ensure_csrf_cookie
from fses.models import *


@ensure_csrf_cookie
@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_csrf(request):
    return Response({'message': 'CSRF cookie set'})


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user:
        login(request, user)
        return Response({'message': 'Login successful'})
    return Response({'error': 'Invalid credentials'}, status=400)


@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logged out successfully'})


@api_view(['GET'])
def current_user(request):
    if request.user.is_authenticated:
        return Response({'id':request.user.id, 'username': request.user.username, 'role': request.user.role, 'is_first_time': request.user.is_first_time})
    return Response({'error': 'Not authenticated'}, status=401)