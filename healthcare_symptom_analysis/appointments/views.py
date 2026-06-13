from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentCreateSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]


    def get_queryset(self):
        user = self.request.user

        if getattr(user, 'role', None) == 'doctor':
            return Appointment.objects.filter(doctor__user=user)

        if getattr(user, 'role', None) == 'patient':
            return Appointment.objects.filter(user=user)

        return Appointment.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return AppointmentCreateSerializer
        return AppointmentSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        appointments = self.get_queryset().filter(
            appointment_date__gte=timezone.now(),
            status__in=['pending', 'confirmed']
        )
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)

   
    @action(detail=False, methods=['get'])
    def past(self, request):
        appointments = self.get_queryset().filter(
            appointment_date__lt=timezone.now(),
            status__in=['completed', 'cancelled']
        )
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'confirmed'
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'cancelled'
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'completed'
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
