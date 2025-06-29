"""
URL configuration for fses_back project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from fses.APIs.student import StudentViewSet
from fses.APIs.lecturer import LecturerViewSet, fetch_lecturers, fetch_lecturer, create_lecturer, update_lecturer, delete_lecturer
from fses.APIs.department import DepartmentViewSet
from fses.APIs.nomination import NominationViewSet
from fses.APIs.postponement import PostponementViewSet
from authentication.views import get_csrf, login_view, logout_view, current_user

# Create a router and register our viewsets with it
router = routers.DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'lecturers', LecturerViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'nominations', NominationViewSet)
router.register(r'postponements', PostponementViewSet)

# Define URL patterns
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/lecturers/', fetch_lecturers, name='fetch-lecturers'),
    path('api/lecturers/<int:id>/', fetch_lecturer, name='fetch-lecturer'),
    path('api/lecturers/create/', create_lecturer, name='create-lecturer'),
    path('api/lecturers/update/<int:id>/', update_lecturer, name='update-lecturer'),
    path('api/lecturers/delete/<int:id>/', delete_lecturer, name='delete-lecturer'),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    
    # Authentication endpoints
    path('auth/csrf/', get_csrf, name='get-csrf'),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/user/', current_user, name='current-user'),
]