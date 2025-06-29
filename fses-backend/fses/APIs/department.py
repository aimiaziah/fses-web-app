from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication
from django.views.decorators.csrf import ensure_csrf_cookie
from ..serializers import DepartmentSerializer
from ..models import Department

class DepartmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows departments to be viewed or edited.
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # All authenticated users can view departments
        return Department.objects.all()
    
    def create(self, request, *args, **kwargs):
        user = self.request.user
        # Only admin users or office assistants can create departments
        if not user.is_staff and user.role != 'office_assistant':
            return Response(
                {"detail": "You do not have permission to create departments"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        user = self.request.user
        # Only admin users or office assistants can update departments
        if not user.is_staff and user.role != 'office_assistant':
            return Response(
                {"detail": "You do not have permission to update departments"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        user = self.request.user
        # Only admin users can delete departments
        if not user.is_staff:
            return Response(
                {"detail": "You do not have permission to delete departments"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

# Keep existing function-based views for backward compatibility
@api_view(['GET'])
def fetch_departments(request):
    departments = Department.objects.all()
    serializer = DepartmentSerializer(departments, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def fetch_department(request, id):
    try:
        department = Department.objects.get(id=id)
        serializer = DepartmentSerializer(department)
        return Response(serializer.data)
    except Department.DoesNotExist:
        return Response({"error": "Department not found"}, status=404)

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def create_department(request):
    if request.method == 'POST':
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['PUT'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def update_department(request, id):
    try:
        department = Department.objects.get(id=id)
    except Department.DoesNotExist:
        return Response({"error": "Department not found"}, status=404)

    if request.method == 'PUT':
        serializer = DepartmentSerializer(department, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

@api_view(['DELETE'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def delete_department(request, id):
    try:
        department = Department.objects.get(id=id)
    except Department.DoesNotExist:
        return Response({"error": "Department not found"}, status=404)

    if request.method == 'DELETE':
        department.delete()
        return Response(status=204)