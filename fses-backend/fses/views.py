# views.py
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication
from django.views.decorators.csrf import ensure_csrf_cookie
from .serializers import *
from .models import *



@api_view(['GET'])
def fetch_lecturers(request):

    lecturers = Lecturer.objects.all()
    Serializer = lecturerSerializer(lecturers, many=True)
    return Response(Serializer.data)