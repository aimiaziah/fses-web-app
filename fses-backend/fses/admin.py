from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django import forms
from .models import CustomUser, Department, Lecturer, Student, Nomination


# Custom forms for handling creation and update of CustomUser in admin
class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'role', 'is_first_time')


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'role', 'is_first_time')


# CustomUser admin class
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser

    list_display = ('username', 'email', 'role', 'is_first_time', 'is_staff', 'is_active')
    list_filter = ('role', 'is_first_time', 'is_staff', 'is_superuser')
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Custom fields', {'fields': ('role', 'is_first_time')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role', 'is_first_time'),
        }),
    )
    
    search_fields = ('username', 'email')
    ordering = ('username',)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name', 'code')
    ordering = ('name',)


@admin.register(Lecturer)
class LecturerAdmin(admin.ModelAdmin):
    list_display = ('name', 'department', 'university', 'get_staff_username')
    list_filter = ('department', 'university')
    search_fields = ('name', 'staff__username')
    raw_id_fields = ('staff', 'department')
    
    def get_staff_username(self, obj):
        return obj.staff.username if obj.staff else "No staff assigned"
    get_staff_username.short_description = "Staff Username"


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('name', 'supervisor', 'program', 'evaluation_type')
    list_filter = ('program', 'evaluation_type')
    search_fields = ('name', 'supervisor__name')
    raw_id_fields = ('supervisor',)
    ordering = ('name',)


@admin.register(Nomination)
class NominationAdmin(admin.ModelAdmin):
    list_display = ('student', 'examiner1', 'examiner2', 'examiner3', 'created_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('student__name', 'examiner1__name', 'examiner2__name', 'examiner3__name')
    raw_id_fields = ('student', 'examiner1', 'examiner2', 'examiner3')
    ordering = ('-created_at',)