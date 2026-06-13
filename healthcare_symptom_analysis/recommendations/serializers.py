from rest_framework import serializers
from .models import Recommendation, DoctorSuggestion



class DoctorSuggestionSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    specialization = serializers.SerializerMethodField()
    doctor_user_id = serializers.SerializerMethodField()  # for frontend isOwn check

    class Meta:
        model = DoctorSuggestion
        fields = [
            'id', 'suggestion_type', 'title', 'reason', 'content',
            'disease_name', 'is_new_disease', 'document', 'document_title',
            'is_public', 'created_at', 'updated_at',
            'doctor', 'doctor_name', 'specialization', 'doctor_user_id',
        ]
        read_only_fields = ['doctor', 'created_at', 'updated_at']
        extra_kwargs = {
            'recommendation': {'required': False, 'allow_null': True},  # make optional
        }

    def get_doctor_name(self, obj):
        if not obj.doctor:
            return "Unknown"
        u = obj.doctor.user
        return u.get_full_name() or u.username

    def get_specialization(self, obj):
        return obj.doctor.specialization if obj.doctor else ""

    def get_doctor_user_id(self, obj):
        return obj.doctor.user.id if obj.doctor else None


class RecommendationSerializer(serializers.ModelSerializer):
    doctor_suggestions = DoctorSuggestionSerializer(many=True, read_only=True)

    # These are read-only display fields
    assessment_id     = serializers.IntegerField(source='assessment.id',           read_only=True)
    assessment_label  = serializers.SerializerMethodField()   # NEW: human-readable label
    patient_name      = serializers.CharField(source='user.get_full_name',          read_only=True)
    username          = serializers.CharField(source='user.username',               read_only=True)

    class Meta:
        model = Recommendation
        fields = [
            'id', 'assessment', 'assessment_id', 'assessment_label',
            'user', 'patient_name', 'username',
            'lifestyle_recommendations', 'medical_advice', 'home_remedies',
            'preventive_measures', 'doctor_consultation_needed', 'urgency_level',
            'doctor_suggestions', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at',
            'assessment_id', 'assessment_label', 'patient_name', 'username',
        ]

    def get_assessment_label(self, obj):
        """Label shown in frontend: Assessment #3 — Headache (12 Jan 2025)"""
        a = obj.assessment
        if not a:
            return None
        date = a.created_at.strftime('%d %b %Y') if hasattr(a, 'created_at') else ''
        # adjust field names to match your Assessment model
        name = getattr(a, 'chief_complaint', None) or getattr(a, 'title', None) or f'Assessment {a.id}'
        return f"#{a.id} — {name} ({date})"