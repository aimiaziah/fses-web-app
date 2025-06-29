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
class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser

    list_display = ('username', 'email', 'role', 'is_first_time', 'is_staff', 'is_active')
    list_filter = ('role', 'is_first_time', 'is_staff', 'is_superuser')
    
    # Update fieldsets to remove usable_password
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('User Role Info', {'fields': ('role', 'is_first_time')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'role', 'is_first_time', 'password1', 'password2'),
        }),
    )
    
    search_fields = ('username', 'email')
    ordering = ('username',)


# Your existing model admins
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "code")


class LecturerAdmin(admin.ModelAdmin):
    list_display = ("name", "title", "university", "department", "get_staff_username")
    
    def get_staff_username(self, obj):
        return obj.staff.username if obj.staff else None
    
    get_staff_username.short_description = "Staff Username"


class StudentAdmin(admin.ModelAdmin):
    list_display = ("name", "supervisor", "program", "evaluation_type")


class NominationAdmin(admin.ModelAdmin):
    list_display = ("student", "examiner1", "examiner2", "examiner3")


# Register all models with admin
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Department, DepartmentAdmin)
admin.site.register(Lecturer, LecturerAdmin)
admin.site.register(Student, StudentAdmin)
admin.site.register(Nomination, NominationAdmin)