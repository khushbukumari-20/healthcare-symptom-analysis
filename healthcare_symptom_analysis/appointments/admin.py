from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):

    list_display = (
        'user',
        'doctor',
        'appointment_date',
        'assessment',
        'status',
    )

    list_filter = (
        'status',
        'appointment_date',
        'assessment'
    )

    search_fields = (
        'user__username',
        'doctor__doctor_name',
    )