from django.contrib import admin

# Register your models here.
from .models import User, MedicalHistory, Allergy, Medication, Doctor

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email','role' ,'age', 'gender', 'created_at')
    search_fields = ('username', 'email', 'role','first_name', 'last_name')
    list_filter = ('gender', 'created_at')

@admin.register(MedicalHistory)
class MedicalHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'condition_name', 'diagnosis_date', 'history_type','status')
    search_fields = ('user__username','history_type', 'condition_name')
    list_filter = ('status','history_type', 'diagnosis_date')

@admin.register(Allergy)
class AllergyAdmin(admin.ModelAdmin):
    list_display = ('user', 'allergen', 'severity')
    search_fields = ('user__username', 'allergen')
    list_filter = ('severity',)

@admin.register(Medication)
class MedicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'medicine_name', 'dosage', 'frequency', 'start_date')
    search_fields = ('user__username', 'medicine_name')
    list_filter = ('start_date',)

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = (
        'doctor_name','specialization', 'phone','email','experience','hospital_name','available')

    search_fields = (
        'doctor_name','specialization','hospital_name')

    list_filter = (
        'specialization','available')
