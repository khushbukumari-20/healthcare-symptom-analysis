from django.db import models

# Create your models here.

from accounts.models import User


class Assessment(models.Model):

    RISK_CHOICES = (
        ('Low',    'Low'),
        ('Medium', 'Medium'),
        ('High',   'High'),
    )

    user     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sympotoms_assessments')

    # Input
    symptoms = models.JSONField()                        # ["Fever", "Cough", ...]
    severity = models.PositiveIntegerField(default=3)   # user-rated 1-5
    duration = models.CharField(max_length=50, blank=True)
    notes    = models.TextField(blank=True)

    # ML results — from disease_model + descriptions + precautions + severity CSV
    predictions      = models.JSONField(null=True, blank=True)
    # [{ rank, disease, probability, description, precautions:[...] }, ...]

    risk_level       = models.CharField(max_length=10, choices=RISK_CHOICES, blank=True)
    risk_score       = models.FloatField(null=True, blank=True)

    matched_symptoms = models.JSONField(null=True, blank=True)
    # [{ name, severity(weight) }, ...]

    unknown_symptoms = models.JSONField(null=True, blank=True)
    total_severity   = models.IntegerField(null=True, blank=True)  # sum of weights

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} | {self.risk_level} | {self.created_at:%Y-%m-%d}"
