from django.db import models

# Create your models here.
from accounts.models import User

class Notification(models.Model):
    NOTIF_TYPES = [
        ('appointment_upcoming',   'Appointment Upcoming'),
        ('appointment_confirmed',  'Appointment Confirmed'),
        ('appointment_cancelled',  'Appointment Cancelled'),
        ('appointment_completed',  'Appointment Completed'),
        ('suggestion_posted',      'New Doctor Suggestion'),
        ('medication_added',       'Medication Added'),
        ('medication_updated',     'Medication Updated'),
        ('general',                'General'),
    ]

    user         = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notif_type   = models.CharField(max_length=40, choices=NOTIF_TYPES, default='general')
    title        = models.CharField(max_length=200)
    message      = models.TextField()
    is_read      = models.BooleanField(default=False)
    navigate_to  = models.CharField(max_length=200, blank=True, help_text="Frontend route e.g. /appointments")
    created_at   = models.DateTimeField(auto_now_add=True)
    related_object_id = models.PositiveIntegerField(null=True, blank=True, help_text="ID of related object e.g. suggestion_id")


    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} — {self.title}"
