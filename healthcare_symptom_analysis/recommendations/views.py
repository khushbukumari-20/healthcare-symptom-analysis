from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q
 
from .models import Recommendation, DoctorSuggestion
from .serializers import RecommendationSerializer, DoctorSuggestionSerializer
 
 
class RecommendationViewSet(viewsets.ModelViewSet):  # was ReadOnlyModelViewSet
    """
    Full CRUD for recommendations.
    - Patients: see only their own
    - Doctors: see all, create for any patient
    """
    serializer_class   = RecommendationSerializer
    permission_classes = [IsAuthenticated]
 
    def get_queryset(self):
        user = self.request.user
        if user.role == 'doctor':
            return Recommendation.objects.all().select_related('user', 'assessment')
        return Recommendation.objects.filter(user=user).select_related('assessment')


    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'doctor':
            patient_id = self.request.data.get('patient')
            if patient_id:
                try:
                    from django.contrib.auth import get_user_model
                    User = get_user_model()
                    patient = User.objects.get(id=patient_id, role='patient')
                    serializer.save(user=patient)  # set patient as the user
                except User.DoesNotExist:
                    from rest_framework.exceptions import ValidationError
                    raise ValidationError({"patient": "Patient not found."})
            else:
                serializer.save(user=user)
        else:
            serializer.save(user=user)  # patient creates for themselves
 
    def update(self, request, *args, **kwargs):
        if request.user.role != 'doctor':
            return Response(
                {'error': 'Only doctors can update recommendations.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
 
    def destroy(self, request, *args, **kwargs):
        if request.user.role != 'doctor':
            return Response(
                {'error': 'Only doctors can delete recommendations.'},
                status=status.HTTP_403_FORBIDDEN
            )
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({'message': 'Recommendation deleted.'}, status=status.HTTP_200_OK)
 
    @action(detail=False, methods=['get'])
    def latest(self, request):
        recommendation = self.get_queryset().first()
        if recommendation:
            return Response(self.get_serializer(recommendation).data)
        return Response({'message': 'No recommendations found'}, status=status.HTTP_404_NOT_FOUND)
 
    @action(detail=True, methods=['get'])
    def doctor_suggestions(self, request, pk=None):
        recommendation = self.get_object()
        suggestions = recommendation.doctor_suggestions.all()
        serializer = DoctorSuggestionSerializer(suggestions, many=True, context={'request': request})
        return Response(serializer.data)
 
 
class DoctorSuggestionViewSet(viewsets.ModelViewSet):
    """
    CRUD for standalone doctor suggestions (from Header).
    - Only doctors can create/edit/delete their own
    - All doctors see public ones + their own private ones
    """
    serializer_class   = DoctorSuggestionSerializer
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]  # file upload support
 

    def get_queryset(self):
        user = self.request.user

        try:
            doctor = user.doctor_profile
        except Exception:
            doctor = None

        if user.role == 'doctor' and doctor:
            return DoctorSuggestion.objects.filter(
                Q(is_public=True) | Q(doctor=doctor)
            ).select_related('doctor').order_by('-created_at')

        return DoctorSuggestion.objects.filter(
            is_public=True
        ).select_related('doctor').order_by('-created_at')
 
    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'doctor':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only doctors can post suggestions.")
        try:
            doctor = user.doctor_profile  # ← adjust if your related_name differs
        except Exception:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"doctor": "Doctor profile not found."})
        serializer.save(doctor=doctor)
 
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            doctor = request.user.doctor_profile
        except Exception:
            return Response({'error': 'Doctor profile not found.'}, status=400)
        if instance.doctor != doctor:
            return Response({'error': 'You can only edit your own suggestions.'}, status=403)
        return super().update(request, *args, **kwargs)
 
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            doctor = request.user.doctor_profile
        except Exception:
            return Response({'error': 'Doctor profile not found.'}, status=400)
        if instance.doctor != doctor:
            return Response({'error': 'You can only delete your own suggestions.'}, status=403)
        instance.delete()
        return Response({'message': 'Suggestion deleted.'}, status=status.HTTP_200_OK)
 