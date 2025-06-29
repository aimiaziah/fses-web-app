from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from ..models import Postponement, Student
from ..serializers import PostponementSerializer

class PostponementViewSet(viewsets.ModelViewSet):
    queryset = Postponement.objects.all()
    serializer_class = PostponementSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'supervisor':
            # Supervisors can see postponements for their students
            try:
                lecturer = user.lecturer
                return Postponement.objects.filter(student__supervisor=lecturer)
            except:
                return Postponement.objects.none()
        elif user.role == 'office_assistant' or user.role == 'program_coordinator' or user.role == 'pgam':
            # Office assistants, program coordinators, and PGAMs can see all postponements
            return Postponement.objects.all()
        return Postponement.objects.none()
    
    def create(self, request, *args, **kwargs):
        user = request.user
        if user.role != 'supervisor':
            return Response(
                {"detail": "Only supervisors can create postponement requests"},
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
        postponement = self.get_object()
        
        # Supervisors can only update their own postponements
        if user.role == 'supervisor':
            try:
                lecturer = user.lecturer
                if postponement.student.supervisor != lecturer:
                    return Response(
                        {"detail": "You can only update postponements for your own students"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except:
                return Response(
                    {"detail": "Lecturer profile not found"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Program coordinators and PGAMs can approve/reject postponements
        elif user.role not in ['program_coordinator', 'pgam']:
            return Response(
                {"detail": "You do not have permission to update postponements"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        user = self.request.user
        postponement = self.get_object()
            
        # Only supervisors who own the postponement or admin users can delete
        if user.role == 'supervisor':
            try:
                lecturer = user.lecturer
                if postponement.student.supervisor != lecturer:
                    return Response(
                        {"detail": "You can only delete postponements for your own students"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except:
                return Response(
                    {"detail": "Lecturer profile not found"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif not user.is_staff:
            return Response(
                {"detail": "You do not have permission to delete postponements"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)