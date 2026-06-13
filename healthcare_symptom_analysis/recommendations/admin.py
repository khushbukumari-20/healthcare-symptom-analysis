from django.contrib import admin
from .models import Recommendation, DoctorSuggestion

@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ('user', 'urgency_level', 'doctor_consultation_needed', 'created_at')
    search_fields = ('user__username',)
    list_filter = ('urgency_level', 'doctor_consultation_needed', 'created_at')
    readonly_fields = ('lifestyle_recommendations', 'medical_advice', 'home_remedies', 'preventive_measures')

@admin.register(DoctorSuggestion)
class DoctorSuggestionAdmin(admin.ModelAdmin):
    list_display = [
        'get_specialization',  # ✅ replaced 'specialization' with a method
        'doctor',
        'title',
        'suggestion_type',
        'is_public',
        'created_at',
    ]

    # ✅ Pull specialization from linked Doctor model
    def get_specialization(self, obj):
        return obj.doctor.specialization if obj.doctor else '—'
    get_specialization.short_description = 'Specialization'