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
def fetch_students(request):

    students = Student.objects.all()
    Serializer = studentSerializer(students, many=True)
    return Response(Serializer.data)


@api_view(['GET'])
def fetch_student(request, id):
    try:
        student = Student.objects.get(id=id)
        Serializer = studentSerializer(student)
        return Response(Serializer.data)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)
    

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def create_student(request):
    if request.method == 'POST':
        serializer = studentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    

@api_view(['PUT'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def update_student(request, id):
    try:
        student = Student.objects.get(id=id)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

    if request.method == 'PUT':
        serializer = studentSerializer(student, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    

@api_view(['DELETE'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def delete_student(request, id):
    try:
        student = Student.objects.get(id=id)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

    if request.method == 'DELETE':
        student.delete()
        return Response(status=204)


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'supervisor':
            # Supervisors can see their own students
            try:
                lecturer = user.lecturer
                return Student.objects.filter(supervisor=lecturer)
            except:
                return Student.objects.none()
        elif user.role == 'office_assistant' or user.role == 'program_coordinator' or user.role == 'pgam':
            # Office assistants, program coordinators, and PGAMs can see all students
            return Student.objects.all()
        return Student.objects.none()
    
    def create(self, request, *args, **kwargs):
        user = self.request.user
        # Only office assistants can create students
        if user.role != 'office_assistant' and not user.is_staff:
            return Response(
                {"detail": "Only office assistants can create students"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        user = self.request.user
        # Only office assistants can update students
        if user.role != 'office_assistant' and not user.is_staff:
            return Response(
                {"detail": "Only office assistants can update students"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        user = self.request.user
        # Only office assistants or admin users can delete students
        if user.role != 'office_assistant' and not user.is_staff:
            return Response(
                {"detail": "Only office assistants can delete students"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)