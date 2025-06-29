from django.urls import path
from fses.APIs.department import *
from fses.APIs.nomination import *
from fses.APIs.lecturer import *
from fses.APIs.student import *
from fses.APIs.postponement import *

urlpatterns = [
    # Lecturer URLs
    path('api/lecturer/', fetch_lecturer),
    path('api/lecturer/<int:id>/', fetch_lecturer),
    path('api/lecturer/create', create_lecturer),
    path('api/lecturer/update/<int:id>/', update_lecturer),
    path('api/lecturer/delete/<int:id>/', delete_lecturer),

    # Nomination URLs
    path('api/nomination/', fetch_nomination),
    path('api/nomination/<int:id>/', fetch_nomination),
    path('api/nomination/create', create_nomination),
    path('api/nomination/update/<int:id>/', update_nomination),
    path('api/nomination/delete/<int:id>/', delete_nomination),

    # Department URLs
    path('api/department/', fetch_department),
    path('api/department/<int:id>/', fetch_department),
    path('api/department/create', create_department),
    path('api/department/update/<int:id>/', update_department),
    path('api/department/delete/<int:id>/', delete_department),

    # Student URLs
    path('api/student/', fetch_student),
    path('api/student/<int:id>/', fetch_student),
    path('api/student/create', create_student),
    path('api/student/update/<int:id>/', update_student),
    path('api/student/delete/<int:id>/', delete_student),
    
    # Postponement URLs
    path('api/postponement/', fetch_postponement),
    path('api/postponement/<int:id>/', fetch_postponement),
    path('api/postponement/create', create_postponement),
    path('api/postponement/update/<int:id>/', update_postponement),
    path('api/postponement/delete/<int:id>/', delete_postponement),
]