# Safe version of fses/management/commands/populate_db.py

from django.core.management.base import BaseCommand
from fses.models import Department, Lecturer, Student, CustomUser, Nomination, Postponement
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from django.db import connection
import random
from datetime import timedelta

class Command(BaseCommand):
    help = 'Populate database with dummy data'

    def table_exists(self, table_name):
        """Check if a table exists in the database"""
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = %s
                );
            """, [table_name])
            return cursor.fetchone()[0]

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating dummy data...')
        
        # Check if tables exist before trying to clear them
        tables_to_check = [
            'fses_postponement',
            'fses_nomination', 
            'fses_student',
            'fses_lecturer',
            'fses_department'
        ]
        
        missing_tables = []
        for table in tables_to_check:
            if not self.table_exists(table):
                missing_tables.append(table)
        
        if missing_tables:
            self.stdout.write(self.style.ERROR(f'Missing tables: {missing_tables}'))
            self.stdout.write(self.style.ERROR('Please run "python manage.py migrate" first'))
            return
        
        # Clear existing data safely
        self.stdout.write('Clearing existing data...')
        try:
            Postponement.objects.all().delete()
            Nomination.objects.all().delete()
            Student.objects.all().delete()
            Lecturer.objects.all().delete()
            Department.objects.all().delete()
            # Keep superusers, delete other users
            CustomUser.objects.filter(is_superuser=False).delete()
            self.stdout.write('Existing data cleared.')
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Could not clear some data: {e}'))
        
        # Create departments with UNIQUE codes
        departments_data = [
            {'name': 'Computer Science', 'code': 'CS'},
            {'name': 'Engineering', 'code': 'ENG'},
            {'name': 'Mathematics', 'code': 'MATH'},
            {'name': 'Physics', 'code': 'PHY'},
            {'name': 'Business', 'code': 'BUS'},
        ]
        
        departments = []
        for dept_data in departments_data:
            dept, created = Department.objects.get_or_create(
                code=dept_data['code'],
                defaults=dept_data
            )
            departments.append(dept)
            if created:
                self.stdout.write(f'Created department: {dept.name} ({dept.code})')
            else:
                self.stdout.write(f'Department already exists: {dept.name} ({dept.code})')
        
        # Create users and lecturers
        lecturer_data = [
            {
                'user': {'username': 'drsmith', 'email': 'smith@utm.edu', 'role': 'SUPERVISOR'},
                'lecturer': {'name': 'Dr. Smith', 'title': 3, 'university': 'UTM', 'department': departments[0]}
            },
            {
                'user': {'username': 'profjohnson', 'email': 'johnson@utm.edu', 'role': 'SUPERVISOR'},
                'lecturer': {'name': 'Prof. Johnson', 'title': 1, 'university': 'UTM', 'department': departments[1]}
            },
            {
                'user': {'username': 'drbrown', 'email': 'brown@utm.edu', 'role': 'SUPERVISOR'},
                'lecturer': {'name': 'Dr. Michael Brown', 'title': 3, 'university': 'UTM', 'department': departments[1]}
            },
            {
                'user': {'username': 'profchen', 'email': 'chen@nus.edu', 'role': 'SUPERVISOR'},
                'lecturer': {'name': 'Prof. Lisa Chen', 'title': 1, 'university': 'NUS', 'department': departments[0]}
            },
            {
                'user': {'username': 'drkim', 'email': 'kim@mit.edu', 'role': 'SUPERVISOR'},
                'lecturer': {'name': 'Dr. David Kim', 'title': 3, 'university': 'MIT', 'department': departments[0]}
            },
            {
                'user': {'username': 'drgarcia', 'email': 'garcia@utm.edu', 'role': 'SUPERVISOR'},
                'lecturer': {'name': 'Dr. Maria Garcia', 'title': 3, 'university': 'UTM', 'department': departments[2]}
            },
        ]
        
        lecturers = []
        for data in lecturer_data:
            user_data = data['user']
            user_data['password'] = make_password('password123')  # Default password
            user, created = CustomUser.objects.get_or_create(
                username=user_data['username'],
                defaults=user_data
            )
            
            lecturer_data_item = data['lecturer']
            lecturer_data_item['staff'] = user
            lecturer, created = Lecturer.objects.get_or_create(
                name=lecturer_data_item['name'],
                defaults=lecturer_data_item
            )
            lecturers.append(lecturer)
            if created:
                self.stdout.write(f'Created lecturer: {lecturer.name}')
            else:
                self.stdout.write(f'Lecturer already exists: {lecturer.name}')
        
        # Create office assistant user
        office_assistant, created = CustomUser.objects.get_or_create(
            username='officeassistant',
            defaults={
                'email': 'office@utm.edu',
                'password': make_password('password123'),
                'role': 'OFFICE_ASSISTANT'
            }
        )
        if created:
            self.stdout.write('Created office assistant user')
        else:
            self.stdout.write('Office assistant user already exists')
        
        # Create program coordinator user
        program_coordinator, created = CustomUser.objects.get_or_create(
            username='coordinator',
            defaults={
                'email': 'coordinator@utm.edu',
                'password': make_password('password123'),
                'role': 'PROGRAM_COORDINATOR'
            }
        )
        if created:
            self.stdout.write('Created program coordinator user')
        else:
            self.stdout.write('Program coordinator user already exists')
        
        # Create PGAM user
        pgam, created = CustomUser.objects.get_or_create(
            username='pgam',
            defaults={
                'email': 'pgam@utm.edu',
                'password': make_password('password123'),
                'role': 'PGAM'
            }
        )
        if created:
            self.stdout.write('Created PGAM user')
        else:
            self.stdout.write('PGAM user already exists')
        
        # Create students
        student_data = [
            {
                'name': 'John Doe',
                'department': departments[0],
                'supervisor': lecturers[0],
                'program': 'PHD',
                'evaluation_type': 'FIRST_EVALUATION',
                'research_title': 'Machine Learning Applications in Healthcare'
            },
            {
                'name': 'Jane Smith',
                'department': departments[1],
                'supervisor': lecturers[1],
                'program': 'MPHIL',
                'evaluation_type': 'FIRST_EVALUATION',
                'research_title': ''
            },
            {
                'name': 'Ali Ahmad',
                'department': departments[0],
                'supervisor': lecturers[0],
                'program': 'PHD',
                'evaluation_type': 'FIRST_EVALUATION',
                'research_title': 'Advanced Neural Networks for Natural Language Processing'
            },
            {
                'name': 'Sarah Johnson',
                'department': departments[2],
                'supervisor': lecturers[5],
                'program': 'DSE',
                'evaluation_type': 'FIRST_EVALUATION',
                'research_title': 'Statistical Analysis of Climate Data'
            },
            {
                'name': 'Michael Wong',
                'department': departments[1],
                'supervisor': lecturers[2],
                'program': 'PHD',
                'evaluation_type': 'RE_EVALUATION',
                'research_title': 'Sustainable Engineering Practices in Urban Development'
            },
            {
                'name': 'Lisa Chen',
                'department': departments[0],
                'supervisor': lecturers[0],
                'program': 'MPHIL',
                'evaluation_type': 'FIRST_EVALUATION',
                'research_title': 'Cybersecurity Frameworks for IoT Devices'
            },
        ]
        
        students = []
        for data in student_data:
            student, created = Student.objects.get_or_create(
                name=data['name'],
                defaults=data
            )
            students.append(student)
            if created:
                self.stdout.write(f'Created student: {student.name}')
            else:
                self.stdout.write(f'Student already exists: {student.name}')
        
        # Create nominations for some students
        nomination_data = [
            {
                'student': students[0],
                'examiner1': lecturers[3],
                'examiner2': lecturers[4],
                'examiner3': None,
            },
            {
                'student': students[2],
                'examiner1': lecturers[3],
                'examiner2': None,
                'examiner1_name': 'Dr. External Examiner',
                'examiner1_email': 'external@example.com',
                'examiner1_university': 'External University',
            },
        ]
        
        for data in nomination_data:
            nomination, created = Nomination.objects.get_or_create(
                student=data['student'],
                defaults=data
            )
            if created:
                self.stdout.write(f'Created nomination for: {data["student"].name}')
            else:
                self.stdout.write(f'Nomination already exists for: {data["student"].name}')
        
        # Create postponements for some students
        today = timezone.now().date()
        postponement_data = [
            {
                'student': students[4],
                'reason': 'Need more time to complete experiments',
                'type': 'ACADEMIC',
                'requested_date': today + timedelta(days=30),
                'comments': 'Equipment issues have delayed my progress',
                'approved': False,
            },
            {
                'student': students[1],
                'reason': 'Medical emergency',
                'type': 'MEDICAL',
                'requested_date': today + timedelta(days=60),
                'comments': 'Will provide medical certificate',
                'approved': None,  # Pending status
            },
        ]
        
        for data in postponement_data:
            postponement, created = Postponement.objects.get_or_create(
                student=data['student'],
                reason=data['reason'],
                defaults=data
            )
            if created:
                self.stdout.write(f'Created postponement for: {data["student"].name}')
            else:
                self.stdout.write(f'Postponement already exists for: {data["student"].name}')
        
        self.stdout.write(self.style.SUCCESS('Successfully populated database with dummy data'))
        self.stdout.write('Created users:')
        self.stdout.write('  - officeassistant / password123 (Office Assistant)')
        self.stdout.write('  - coordinator / password123 (Program Coordinator)')
        self.stdout.write('  - pgam / password123 (PGAM)')
        self.stdout.write('  - drsmith / password123 (Supervisor)')
        self.stdout.write('  - profjohnson / password123 (Supervisor)')
        self.stdout.write('  - drbrown / password123 (Supervisor)')
        self.stdout.write('  - profchen / password123 (Supervisor)')
        self.stdout.write('  - drkim / password123 (Supervisor)')
        self.stdout.write('  - drgarcia / password123 (Supervisor)')