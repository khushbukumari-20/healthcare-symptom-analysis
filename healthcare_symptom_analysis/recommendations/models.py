from django.db import models
from accounts.models import User
# from assessments.models import Assessment
from symptoms.models import Assessment


class Recommendation(models.Model):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='recommendations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recommendations')
    
    # Generated content
    lifestyle_recommendations = models.TextField()
    medical_advice = models.TextField()
    home_remedies = models.TextField()
    preventive_measures = models.TextField()
    
    # Additional data
    doctor_consultation_needed = models.BooleanField(default=False)
    urgency_level = models.CharField(max_length=20, choices=[
        ('routine', 'Routine'),
        ('soon', 'Should see doctor soon'),
        ('urgent', 'See doctor immediately'),
    ], default='routine')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Recommendations for {self.user.username} - {self.assessment.id}"


class DoctorSuggestion(models.Model):
    SUGGESTION_TYPES = [
        ('recommendation', 'Patient Recommendation'),
        ('research',       'Medical Research / New Finding'),
        ('case_study',     'Case Study'),
        ('general',        'General Advisory'),
    ]

    recommendation = models.ForeignKey(
        Recommendation, on_delete=models.CASCADE,
        related_name='doctor_suggestions',
        null=True, blank=True   # nullable so doctor can post standalone
    )
    doctor = models.ForeignKey(
        'accounts.Doctor', on_delete=models.CASCADE,
        related_name='suggestions',
        null=True, blank=True
    )
    # specialization = models.CharField(max_length=200)
    reason          = models.TextField()

    suggestion_type = models.CharField(
        max_length=30, choices=SUGGESTION_TYPES, default='recommendation'
    )
    title           = models.CharField(max_length=300, blank=True)
    content         = models.TextField(blank=True, help_text="Detailed suggestion or new findings")
    disease_name    = models.CharField(max_length=200, blank=True, help_text="Related disease if any")
    is_new_disease  = models.BooleanField(default=False)
    document        = models.FileField(
        upload_to='doctor_suggestions/documents/',
        null=True, blank=True
    )
    document_title  = models.CharField(max_length=200, blank=True)
    is_public       = models.BooleanField(default=True, help_text="Visible to all doctors")
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']


    def __str__(self):
        doctor_name = self.doctor.user.get_full_name() if self.doctor else "Unknown"
        return f"{doctor_name} - {self.title or self.reason[:50]}"