"""
URL configuration for fses_back project.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from fses.APIs.student import StudentViewSet, fetch_students, fetch_student, create_student, update_student, delete_student
from fses.APIs.lecturer import LecturerViewSet, fetch_lecturers, fetch_lecturer, create_lecturer, update_lecturer, delete_lecturer
from fses.APIs.department import DepartmentViewSet
from fses.APIs.nomination import NominationViewSet
from authentication.views import get_csrf, login_view, logout_view, current_user

# Create router for ViewSets
router = DefaultRouter()
router.register(r'lecturers', LecturerViewSet)
router.register(r'students', StudentViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'nominations', NominationViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Individual API endpoints (function-based views)
    path('api/lecturers/', fetch_lecturers, name='fetch-lecturers'),
    path('api/lecturers/<int:id>/', fetch_lecturer, name='fetch-lecturer'),
    path('api/lecturers/create/', create_lecturer, name='create-lecturer'),
    path('api/lecturers/update/<int:id>/', update_lecturer, name='update-lecturer'),
    path('api/lecturers/delete/<int:id>/', delete_lecturer, name='delete-lecturer'),
    
    path('api/students/', fetch_students, name='fetch-students'),
    path('api/students/<int:id>/', fetch_student, name='fetch-student'),
    path('api/students/create/', create_student, name='create-student'),
    path('api/students/update/<int:id>/', update_student, name='update-student'),
    path('api/students/delete/<int:id>/', delete_student, name='delete-student'),
    
    # ViewSet endpoints (if you want to use both approaches)
    path('fses/api/', include(router.urls)),
    
    # DRF browsable API
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    
    # Authentication endpoints
    path('auth/csrf/', get_csrf, name='get-csrf'),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/user/', current_user, name='current-user'),
]