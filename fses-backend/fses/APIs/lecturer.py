from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication
from django.views.decorators.csrf import ensure_csrf_cookie
from ..serializers import LecturerSerializer  # Updated to match the actual serializer name
from ..models import Lecturer

class LecturerViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows lecturers to be viewed or edited.
    """
    queryset = Lecturer.objects.all()
    serializer_class = LecturerSerializer  # Updated to match the actual serializer name
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # All authenticated users can view lecturers
        return Lecturer.objects.all()
    
    def create(self, request, *args, **kwargs):
        user = self.request.user
        # Only admin users or office assistants can create lecturers
        if not user.is_staff and user.role != 'office_assistant':
            return Response(
                {"detail": "You do not have permission to create lecturers"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        user = self.request.user
        # Only admin users or office assistants can update lecturers
        if not user.is_staff and user.role != 'office_assistant':
            return Response(
                {"detail": "You do not have permission to update lecturers"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        user = self.request.user
        # Only admin users can delete lecturers
        if not user.is_staff:
            return Response(
                {"detail": "You do not have permission to delete lecturers"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

# Keep your existing function-based views for backward compatibility
@api_view(['GET'])
def fetch_lecturers(request):
    lecturers = Lecturer.objects.all()
    serializer = LecturerSerializer(lecturers, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def fetch_lecturer(request, id):
    try:
        lecturer = Lecturer.objects.get(id=id)
        serializer = LecturerSerializer(lecturer)
        return Response(serializer.data)
    except Lecturer.DoesNotExist:
        return Response({"error": "Lecturer not found"}, status=404)

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def create_lecturer(request):
    if request.method == 'POST':
        serializer = LecturerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['PUT'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def update_lecturer(request, id):
    try:
        lecturer = Lecturer.objects.get(id=id)
    except Lecturer.DoesNotExist:
        return Response({"error": "Lecturer not found"}, status=404)

    if request.method == 'PUT':
        serializer = LecturerSerializer(lecturer, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

@api_view(['DELETE'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def delete_lecturer(request, id):
    try:
        lecturer = Lecturer.objects.get(id=id)
    except Lecturer.DoesNotExist:
        return Response({"error": "Lecturer not found"}, status=404)

    if request.method == 'DELETE':
        lecturer.delete()
        return Response(status=204)