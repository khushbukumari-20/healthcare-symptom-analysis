from django.db import models

# Create your models here.

from django.contrib.auth.models import AbstractUser


class User(AbstractUser):

    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('doctor', 'Doctor'),
        ('patient', 'Patient'),
        ('nurse', 'Nurse'),
    )

    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    )

    BLOOD_GROUP_CHOICES = (
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='patient'
    )


    phone = models.CharField(max_length=15, unique=True, null=True, blank=True)

    age = models.PositiveIntegerField(null=True, blank=True)

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        null=True,
        blank=True
    )

    weight = models.FloatField(null=True, blank=True)

    height = models.FloatField(null=True, blank=True)

    blood_type = models.CharField(
        max_length=5,
        choices=BLOOD_GROUP_CHOICES,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    # def __str__(self):
    #     return self.username

    def bmi(self):
        if self.weight and self.height:
            height_m = self.height / 100
            return round(self.weight / (height_m ** 2), 2)
        return None

    def __str__(self):
        return self.get_full_name() or self.username

class MedicalHistory(models.Model):
    HISTORY_TYPE_CHOICES = (
        ('patient', 'Patient'),
        ('family',  'Family'),
    )
    STATUS_CHOICES = (
        ('active',    'Active'),
        ('resolved',  'Resolved'),
        ('chronic',   'Chronic'),
    )

    user             = models.ForeignKey(User, on_delete=models.CASCADE, related_name='medical_history')
    condition_name   = models.CharField(max_length=200)
    diagnosis_date   = models.DateField()
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    notes            = models.TextField(blank=True, null=True)
    # NEW FIELDS ↓
    history_type     = models.CharField(max_length=10, choices=HISTORY_TYPE_CHOICES, default='patient')
    parent_relation  = models.CharField(max_length=100, blank=True, null=True)  # e.g. "Father", "Mother"

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Allergy(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='allergies')
    allergen = models.CharField(max_length=200)
    severity = models.CharField(max_length=50, choices=[
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
    ])
    reaction = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'allergen')
    
    def __str__(self):
        return f"{self.user.username} - {self.allergen}"



class Doctor(models.Model):

    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    )

    SPECIALIZATION_CHOICES = (
        ('Cardiologist', 'Cardiologist'),
        ('Dermatologist', 'Dermatologist'),
        ('Neurologist', 'Neurologist'),
        ('Orthopedic', 'Orthopedic'),
        ('General Physician', 'General Physician'),
        ('Pediatrician', 'Pediatrician'),
        ('Psychiatrist', 'Psychiatrist'),
        ('Gynecologist', 'Gynecologist'),
    )

     # ✅ NEW: Link Doctor to User account
    user = models.OneToOneField(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='doctor_profile'  # lets us do request.user.doctor_profile
    )

    doctor_name = models.CharField(max_length=200)

    email = models.EmailField(unique=True)

    phone = models.CharField(max_length=15, unique=True)

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        null=True,
        blank=True
    )

    specialization = models.CharField(
        max_length=100,
        choices=SPECIALIZATION_CHOICES
    )

    # qualification = models.CharField(max_length=200)
    QUALIFICATION_CHOICES = (
    ('MBBS', 'MBBS'),
    ('MD', 'MD'),
    ('MS', 'MS'),
    ('BDS', 'BDS'),
    ('MDS', 'MDS'),
    ('DM', 'DM'),
    ('MCh', 'MCh'),
    ('BHMS', 'BHMS'),
    ('BAMS', 'BAMS'),
    ('BUMS', 'BUMS'),
    ('DNB', 'DNB'),)

    qualification = models.CharField(
        max_length=50,
        choices=QUALIFICATION_CHOICES
    )

    experience = models.PositiveIntegerField(
        help_text="Experience in years"
    )

    hospital_name = models.CharField(max_length=255)

    address = models.TextField(blank=True, null=True)

    consultation_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    available = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['doctor_name']

    def __str__(self):
        return f"Dr. {self.doctor_name} - {self.specialization}"


class Medication(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
        ('discontinued', 'Discontinued'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='medications', help_text="The patient who takes this medication")
    medicine_name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    reason = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')  # NEW
    notes = models.TextField(blank=True, null=True)                                      # NEW
    prescribed_by = models.ForeignKey(
            Doctor,
            on_delete=models.SET_NULL,
            null=True, blank=True,
            related_name='prescribed_medications'
        )    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.user.username} - {self.medicine_name}"

    @property
    def patient_name(self):
        """Get patient's full name"""
        return self.user.get_full_name() or self.user.username