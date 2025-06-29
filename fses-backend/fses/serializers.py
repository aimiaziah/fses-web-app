from rest_framework import serializers
from .models import CustomUser, Department, Lecturer, Student, Nomination, Postponement

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name']

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'is_first_time']
        extra_kwargs = {'password': {'write_only': True}}

class LecturerSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True
    )
    staff = CustomUserSerializer(read_only=True)
    staff_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        source='staff',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Lecturer
        fields = ['id', 'name', 'title', 'department', 'department_id', 'university', 'staff', 'staff_id']

class StudentSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True
    )
    supervisor = LecturerSerializer(read_only=True)
    supervisor_id = serializers.PrimaryKeyRelatedField(
        queryset=Lecturer.objects.all(),
        source='supervisor',
        write_only=True
    )
    
    class Meta:
        model = Student
        fields = ['id', 'name', 'department', 'department_id', 'supervisor', 'supervisor_id', 'program', 'evaluation_type', 'research_title']

class NominationSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(),
        source='student',
        write_only=True
    )
    examiner1 = LecturerSerializer(read_only=True)
    examiner1_id = serializers.PrimaryKeyRelatedField(
        queryset=Lecturer.objects.all(),
        source='examiner1',
        write_only=True,
        required=False,
        allow_null=True
    )
    examiner2 = LecturerSerializer(read_only=True)
    examiner2_id = serializers.PrimaryKeyRelatedField(
        queryset=Lecturer.objects.all(),
        source='examiner2',
        write_only=True,
        required=False,
        allow_null=True
    )
    examiner3 = LecturerSerializer(read_only=True)
    examiner3_id = serializers.PrimaryKeyRelatedField(
        queryset=Lecturer.objects.all(),
        source='examiner3',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Nomination
        fields = [
            'id', 'student', 'student_id', 
            'examiner1', 'examiner1_id', 'examiner2', 'examiner2_id', 'examiner3', 'examiner3_id',
            'examiner1_name', 'examiner1_email', 'examiner1_university',
            'examiner2_name', 'examiner2_email', 'examiner2_university',
            'created_at', 'updated_at'
        ]

class PostponementSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(),
        source='student',
        write_only=True
    )
    
    class Meta:
        model = Postponement
        fields = [
            'id', 'student', 'student_id', 'reason', 'type', 
            'requested_date', 'comments', 'approved',
            'created_at', 'updated_at'
        ]
