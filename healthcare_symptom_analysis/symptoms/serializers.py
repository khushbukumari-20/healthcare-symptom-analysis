from rest_framework import serializers
from .models import Assessment


class AssessmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Assessment
        fields = ['id', 'symptoms', 'severity', 'duration', 'notes']
        read_only_fields = ['id']

    def validate_symptoms(self, value):
        if not isinstance(value, list) or len(value) == 0:
            raise serializers.ValidationError("Provide at least one symptom.")
        return value

    def validate_severity(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Severity must be 1–5.")
        return value


class AssessmentResultSerializer(serializers.ModelSerializer):
    """Full result including ML data from all 4 CSV files."""
    class Meta:
        model  = Assessment
        fields = [
            'id', 'symptoms', 'severity', 'duration', 'notes',
            'predictions',        # disease + probability + description + precautions
            'risk_level',
            'risk_score',
            'matched_symptoms',   # name + severity weight
            'unknown_symptoms',
            'total_severity',
            'created_at',
        ]
        read_only_fields = fields


class AssessmentListSerializer(serializers.ModelSerializer):
    """Compact for history list."""
    top_prediction = serializers.SerializerMethodField()

    class Meta:
        model  = Assessment
        fields = [
            'id', 'symptoms', 'severity', 'duration',
            'risk_level', 'risk_score', 'top_prediction',
            'total_severity', 'created_at',
        ]
        read_only_fields = fields

    def get_top_prediction(self, obj):
        if obj.predictions and len(obj.predictions) > 0:
            p = obj.predictions[0]
            return {
                'disease'    : p.get('disease', ''),
                'probability': p.get('probability', 0),
            }
        return None