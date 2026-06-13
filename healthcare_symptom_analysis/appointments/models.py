from django.db import models
from django.utils import timezone

from accounts.models import User, Doctor
# from assessments.models import Assessment
from symptoms.models import Assessment



class Appointment(models.Model):

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='appointments'
    )

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='appointments'
    )

    # assessment = models.ForeignKey(
    #     Assessment,
    #     on_delete=models.CASCADE,
    #     related_name='assessments',
    #     null=True,
    #     blank=True,
    # )

    assessment = models.ForeignKey(
        blank=True,
        null=True,
        on_delete= models.CASCADE,
        related_name="assessments",
        to="symptoms.assessment",
        )

    # assessment = models.ForeignKey(
    #     Assessment,
    #     on_delete=models.CASCADE,
    #     related_name='appointments',
    #     null=True,
    #     blank=True
    # )

    appointment_date = models.DateTimeField()

    duration_minutes = models.PositiveIntegerField(default=30)

    reason = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-appointment_date']

    def __str__(self):
        return f"{self.user.username} - Dr. {self.doctor.doctor_name}"

    def is_upcoming(self):
        return (
            self.appointment_date > timezone.now()
            and self.status != 'cancelled'
        )