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
    Serializer = nominationSerializer(nominations, many=True)
    return Response(Serializer.data)


@api_view(['GET'])
def fetch_nomination(request, id):
    try:
        nomination = Nomination.objects.get(id=id)
        Serializer = nominationSerializer(nomination)
        return Response(Serializer.data)
    except Nomination.DoesNotExist:
        return Response({"error": "Nomination not found"}, status=404)
    

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def create_nomination(request):
    if request.method == 'POST':
        serializer = nominationSerializer(data=request.data)
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
        serializer = nominationSerializer(nomination, data=request.data)
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
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'supervisor':
            # Supervisors can see nominations for their students
            try:
                lecturer = user.lecturer
                return Nomination.objects.filter(student__supervisor=lecturer)
            except:
                return Nomination.objects.none()
        elif user.role == 'office_assistant' or user.role == 'program_coordinator' or user.role == 'pgam':
            # Office assistants, program coordinators, and PGAMs can see all nominations
            return Nomination.objects.all()
        return Nomination.objects.none()
    
    def create(self, request, *args, **kwargs):
        user = self.request.user
        if user.role != 'supervisor':
            return Response(
                {"detail": "Only supervisors can create nominations"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validate that the student belongs to the supervisor
        student_id = request.data.get('student')
        try:
            lecturer = user.lecturer
            student = Student.objects.get(id=student_id, supervisor=lecturer)
        except:
            return Response(
                {"detail": "Student not found or does not belong to this supervisor"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        user = self.request.user
        nomination = self.get_object()
        
        # Check if nomination is locked
        if nomination.is_locked and user.role != 'program_coordinator' and user.role != 'pgam':
            return Response(
                {"detail": "This nomination is locked and cannot be modified"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Supervisors can only update their own nominations
        if user.role == 'supervisor':
            try:
                lecturer = user.lecturer
                if nomination.student.supervisor != lecturer:
                    return Response(
                        {"detail": "You can only update nominations for your own students"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except:
                return Response(
                    {"detail": "Lecturer profile not found"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Office assistants, program coordinators, and PGAMs can update any nomination
        elif user.role not in ['office_assistant', 'program_coordinator', 'pgam']:
            return Response(
                {"detail": "You do not have permission to update nominations"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        user = self.request.user
        nomination = self.get_object()
        
        # Check if nomination is locked
        if nomination.is_locked:
            return Response(
                {"detail": "This nomination is locked and cannot be deleted"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Only supervisors who own the nomination or admin users can delete
        if user.role == 'supervisor':
            try:
                lecturer = user.lecturer
                if nomination.student.supervisor != lecturer:
                    return Response(
                        {"detail": "You can only delete nominations for your own students"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except:
                return Response(
                    {"detail": "Lecturer profile not found"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif not user.is_staff and user.role != 'office_assistant':
            return Response(
                {"detail": "You do not have permission to delete nominations"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)