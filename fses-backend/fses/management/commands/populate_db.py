from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from fses.models import CustomUser, Department, Lecturer, Student, Nomination
from datetime import timezone, timedelta


class Command(BaseCommand):
    help = 'Populate database with dummy data'

    def handle(self, *args, **kwargs):
        # Create departments
        departments_data = [
            {'name': 'Software Engineering and Advanced Technology', 'code': 'SEAT'},
            {'name': 'Information and Intelligence', 'code': 'II'},
            {'name': 'Bioinformatics and Health Geography', 'code': 'BIHG'},
            {'name': 'Cybersecurity and Artificial Intelligence', 'code': 'CAI'},
        ]
        
        departments = []
        for dept_data in departments_data:
            dept, created = Department.objects.get_or_create(
                code=dept_data['code'],
                defaults={'name': dept_data['name']}
            )
            departments.append(dept)
            if created:
                self.stdout.write(f'Created department: {dept.name}')
            else:
                self.stdout.write(f'Department already exists: {dept.name}')
        
        # Create lecturers
        lecturers_data = [
            {
                'name': 'Dr. Ahmad Rahman',
                'department': departments[0],
                'title': 3,
                'university': 'UTM'
            },
            {
                'name': 'Prof. Dr. Siti Aminah',
                'department': departments[1],
                'title': 1,
                'university': 'UTM'
            },
            {
                'name': 'AP. Dr. Mohammad Ali',
                'department': departments[2],
                'title': 2,
                'university': 'UTM'
            },
            {
                'name': 'Dr. Fatimah Wong',
                'department': departments[3],
                'title': 3,
                'university': 'UTM'
            },
            {
                'name': 'Prof. Dr. Kumar Singh',
                'department': departments[0],
                'title': 1,
                'university': 'External University'
            },
        ]
        
        lecturers = []
        for lect_data in lecturers_data:
            lecturer, created = Lecturer.objects.get_or_create(
                name=lect_data['name'],
                defaults=lect_data
            )
            lecturers.append(lecturer)
            if created:
                self.stdout.write(f'Created lecturer: {lecturer.name}')
            else:
                self.stdout.write(f'Lecturer already exists: {lecturer.name}')
        
        # Create users
        office_assistant, created = CustomUser.objects.get_or_create(
            username='office_assistant',
            defaults={
                'email': 'office@utm.edu',
                'role': 'OFFICE_ASSISTANT',
                'is_first_time': False
            }
        )
        if created:
            office_assistant.set_password('password123')
            office_assistant.save()
            self.stdout.write('Created office assistant user')
        else:
            self.stdout.write('Office assistant user already exists')
        
        # Create supervisor user
        supervisor, created = CustomUser.objects.get_or_create(
            username='supervisor',
            defaults={
                'email': 'supervisor@utm.edu',
                'role': 'SUPERVISOR',
                'is_first_time': False
            }
        )
        if created:
            supervisor.set_password('password123')
            supervisor.save()
            self.stdout.write('Created supervisor user')
        else:
            self.stdout.write('Supervisor user already exists')
        
        # Link supervisor user to lecturer
        lecturers[0].staff = supervisor
        lecturers[0].save()
        
        # Create program coordinator user
        coordinator, created = CustomUser.objects.get_or_create(
            username='program_coordinator',
            defaults={
                'email': 'coordinator@utm.edu',
                'role': 'PROGRAM_COORDINATOR',
                'is_first_time': False
            }
        )
        if created:
            coordinator.set_password('password123')
            coordinator.save()
            self.stdout.write('Created program coordinator user')
        else:
            self.stdout.write('Program coordinator user already exists')
        
        # Create PGAM user
        pgam, created = CustomUser.objects.get_or_create(
            username='pgam',
            defaults={
                'email': 'pgam@utm.edu',
                'role': 'PGAM',
                'is_first_time': False
            }
        )
        if created:
            pgam.set_password('password123')
            pgam.save()
            self.stdout.write('Created PGAM user')
        else:
            self.stdout.write('PGAM user already exists')
        
        # Create students
        student_data = [
            {
                'student_id': 'PRT203089',
                'name': 'AHMAD FAIRUZ BIN ALI',
                'department': departments[0],
                'supervisor': lecturers[0],
                'co_supervisor': lecturers[3],
                'program': 'PHD',
                'evaluation_type': 'FIRST_EVALUATION',
                'research_title': 'Causal inference in banking sector',
                'semester': 3
            },
            {
                'student_id': 'MRT233008',
                'name': 'AINUL FARHAH BINTI MOHD FAHIMEY',
                'department': departments[1],
                'supervisor': lecturers[1],
                'program': 'MPHIL',
                'evaluation_type': 'FIRST_EVALUATION',
                'research_title': 'ENHANCING LEARNING MANAGEMENT SYSTEM UTILIZATION FOR VOCATIONAL COLLEGES IN MALAYSIA',
                'semester': 2
            },
            {
                'student_id': 'PRT233007',
                'name': 'ANIS AFIQAH BINTI SHARIP',
                'department': departments[2],
                'supervisor': lecturers[2],
                'co_supervisor': lecturers[3],
                'program': 'PHD',
                'evaluation_type': 'FIRST_EVALUATION',
                'research_title': 'Design Thinking Framework for Requirements Elicitation with Cognitive Consideration for Older Adults',
                'semester': 3
            },
            {
                'student_id': 'PRT213048',
                'name': 'AYMEN YOUSEF AHMED ASHAWESH',
                'department': departments[3],
                'supervisor': lecturers[3],
                'program': 'PHD',
                'evaluation_type': 'RE_EVALUATION',
                'research_title': 'TOWARDS THE ADOPTION OF DISTANT LEARNING IN CONFLICT ZONES',
                'semester': 7
            },
            {
                'student_id': 'DSE223001',
                'name': 'FATIMAH ZAHRA',
                'department': departments[0],
                'supervisor': lecturers[0],
                'program': 'DSE',
                'evaluation_type': 'FIRST_EVALUATION',
                'research_title': '',
                'semester': 1
            },
            {
                'student_id': 'PRT223046',
                'name': 'BAHAA SALIM ABDULAMEER',
                'department': departments[2],
                'supervisor': lecturers[2],
                'program': 'PHD',
                'evaluation_type': 'RE_EVALUATION',
                'research_title': 'EXPLAINABLE ARTIFICIAL INTELLIGENCE (XAI) TECHNIQUES IN LUNG DISEASE',
                'semester': 4
            },
        ]
        
        students = []
        for data in student_data:
            student, created = Student.objects.get_or_create(
                student_id=data['student_id'],
                defaults=data
            )
            students.append(student)
            if created:
                self.stdout.write(f'Created student: {data["name"]}')
            else:
                self.stdout.write(f'Student already exists: {data["name"]}')
        
        # Create nominations for some students
        nomination_data = [
            {
                'student': students[0],
                'examiner1': lecturers[1],
                'examiner2': lecturers[2],
                'examiner3': lecturers[4],
                'chairperson': lecturers[1],  # Prof. Dr. Siti Aminah
            },
            {
                'student': students[1],
                'examiner1': lecturers[0],
                'examiner2': lecturers[3],
                'examiner3': lecturers[2],
                'chairperson': lecturers[4],  # Prof. Dr. Kumar Singh
            },
            {
                'student': students[2],
                'examiner1': lecturers[1],
                'examiner2': lecturers[3],
                'examiner3': lecturers[0],
            },
            {
                'student': students[3],
                'examiner1': lecturers[2],
                'examiner2': lecturers[0],
                'examiner3': lecturers[3],
                'chairperson': lecturers[1],  # Prof. Dr. Siti Aminah
            },
            {
                'student': students[5],
                'examiner1_name': 'External Examiner',
                'examiner1_email': 'external@example.com',
                'examiner1_university': 'External University',
                'examiner2': lecturers[0],
                'examiner3': lecturers[2],
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
        
        self.stdout.write(self.style.SUCCESS('Successfully populated database with dummy data'))