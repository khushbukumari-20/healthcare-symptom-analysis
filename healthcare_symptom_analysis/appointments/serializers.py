from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):

    doctor_name = serializers.CharField(
        source='doctor.doctor_name',
        read_only=True
    )

    specialization = serializers.CharField(
        source='doctor.specialization',
        read_only=True
    )

    hospital_name = serializers.CharField(
        source='doctor.hospital_name',
        read_only=True
    )

    class Meta:
        model = Appointment
        fields = '__all__'


class AppointmentCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Appointment
        fields = [
            'doctor',
            'appointment_date',
            'duration_minutes',
            'reason',
        ]