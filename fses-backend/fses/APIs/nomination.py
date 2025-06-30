# views.py
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication
from django.views.decorators.csrf import ensure_csrf_cookie
from ..serializers import *
from ..models import *
from rest_framework import viewsets, permissions, status


@api_view(['GET'])
def fetch_nominations(request):

    nominations = Nomination.objects.all()
    Serializer = NominationSerializer(nominations, many=True)
    return Response(Serializer.data)


@api_view(['GET'])
def fetch_nomination(request, id):
    try:
        nomination = Nomination.objects.get(id=id)
        Serializer = NominationSerializer(nomination)
        return Response(Serializer.data)
    except Nomination.DoesNotExist:
        return Response({"error": "Nomination not found"}, status=404)
    

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def create_nomination(request):
    if request.method == 'POST':
        serializer = NominationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    

@api_view(['PUT'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def update_nomination(request, id):
    try:
        nomination = Nomination.objects.get(id=id)
    except Nomination.DoesNotExist:
        return Response({"error": "Nomination not found"}, status=404)

    if request.method == 'PUT':
        serializer = NominationSerializer(nomination, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    

@api_view(['DELETE'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def delete_nomination(request, id):
    try:
        nomination = Nomination.objects.get(id=id)
    except Nomination.DoesNotExist:
        return Response({"error": "Nomination not found"}, status=404)

    if request.method == 'DELETE':
        nomination.delete()
        return Response(status=204)


class NominationViewSet(viewsets.ModelViewSet):
    queryset = Nomination.objects.all()
    serializer_class = NominationSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        user = self.request.user
        
        # If user is not authenticated, return all nominations (for development)
        if not user.is_authenticated:
            return Nomination.objects.all()
            
        if hasattr(user, 'role'):
            if user.role == 'supervisor':
                # Supervisors can see nominations for their students
                try:
                    lecturer = user.lecturer
                    return Nomination.objects.filter(student__supervisor=lecturer)
                except:
                    return Nomination.objects.all()
            elif user.role in ['office_assistant', 'program_coordinator', 'pgam']:
                # Office assistants, program coordinators, and PGAMs can see all nominations
                return Nomination.objects.all()
        
        # Default: return all nominations
        return Nomination.objects.all()