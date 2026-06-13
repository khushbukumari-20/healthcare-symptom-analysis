from django.shortcuts import render
# Create your views here.
import requests
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Assessment
from .serializers import (
    AssessmentCreateSerializer,
    AssessmentResultSerializer,
    AssessmentListSerializer,
)

ML_URL = getattr(settings, 'ML_SERVICE_URL', 'http://localhost:8001')


def call_ml(path, method='get', json=None, timeout=10):
    """Generic helper to call the FastAPI ML service."""
    try:
        url  = f"{ML_URL}{path}"
        resp = getattr(requests, method)(url, json=json, timeout=timeout)
        resp.raise_for_status()
        return resp.json(), None
    except requests.exceptions.ConnectionError:
        return None, ("ML service is offline. Start it with: "
                      "uvicorn main:app --reload --port 8001", 503)
    except requests.exceptions.Timeout:
        return None, ("ML service timed out.", 504)
    except requests.exceptions.HTTPError as e:
        return None, (str(e), 502)


class AssessmentViewSet(viewsets.GenericViewSet):
    """
    router.register(r'assessments', AssessmentViewSet, basename='assessment')

    Endpoints:
      POST   /api/symptoms/assessments/              save assessment result to DB
      POST   /api/symptoms/assessments/predict/      submit symptoms → ML result (NO SAVE - frontend saves)
      GET    /api/symptoms/assessments/              list past assessments
      GET    /api/symptoms/assessments/{id}/         single assessment
      DELETE /api/symptoms/assessments/{id}/         delete assessment
      GET    /api/symptoms/assessments/symptoms/     all symptoms + severity weights
      GET    /api/symptoms/assessments/diseases/     all diseases + descriptions + precautions
      GET    /api/symptoms/assessments/disease/{name}/  single disease detail
    """
    permission_classes = [IsAuthenticated]

    # def get_queryset(self):
    #     return Assessment.objects.filter(user=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.role == 'doctor':
            user_id = self.request.query_params.get('user')
            if user_id:
                return Assessment.objects.filter(user_id=user_id)
            return Assessment.objects.all()
        return Assessment.objects.filter(user=user)

    

    # ── POST / create ─────────────────────────────────────
    def create(self, request):
        """
        Save an assessment result to the database.
        This is called after ML prediction is already done on the frontend.
        
        Body:
        {
            "symptoms": ["Fever", "Cough"],
            "severity": 3,
            "duration": "1-3 days",
            "notes": "Optional notes",
            "risk_level": "Low",
            "risk_score": 25,
            "top_prediction": {"disease": "Common Cold", "probability": 72},
            "predictions": [
                {"rank": 1, "disease": "Common Cold", "probability": 72, "description": "...", "precautions": [...]},
                {"rank": 2, "disease": "Flu", "probability": 45, "description": "...", "precautions": [...]}
            ],
            "matched_symptoms": [{"name": "Fever", "severity": 0.8}],
            "unknown_symptoms": []
        }
        """
        # Validate input
        serializer = AssessmentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Save to DB
        assessment = Assessment.objects.create(
            user             = request.user,
            symptoms         = serializer.validated_data.get('symptoms', []),
            severity         = serializer.validated_data.get('severity', 3),
            duration         = serializer.validated_data.get('duration', ''),
            notes            = serializer.validated_data.get('notes', ''),
            predictions      = request.data.get('predictions', []),
            risk_level       = request.data.get('risk_level', 'Low'),
            risk_score       = request.data.get('risk_score', 0),
            matched_symptoms = request.data.get('matched_symptoms', []),
            unknown_symptoms = request.data.get('unknown_symptoms', []),
            total_severity   = request.data.get('total_severity', 0),
        )
        print("SAVED:", assessment.id)

        return Response(
            AssessmentResultSerializer(assessment).data,
            status=status.HTTP_201_CREATED,
        )
        

    # ── POST /predict/ ────────────────────────────────────
    @action(detail=False, methods=['post'], url_path='predict')
    def predict(self, request):
        """
        Submit symptoms to ML service for prediction.
        DOES NOT SAVE TO DATABASE - frontend will handle saving via POST /assessments/
        
        This allows frontend to show results first, then user clicks "Save & Continue"
        to save to database. Prevents automatic saving without user confirmation.
        
        Body:
        {
            "symptoms": ["Fever", "Cough", "Fatigue"],
            "severity": 3,
            "duration": "1-3 days",
            "notes": ""
        }
        Returns: predictions, risk_level, risk_score, matched_symptoms, unknown_symptoms
        """
        serializer = AssessmentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Call ML service
        ml_data, err = call_ml(
            '/predict', method='post',
            json={
                'symptoms': serializer.validated_data['symptoms'],
                'top_n'   : 5,
            }
        )
        if err:
            return Response({'error': err[0]}, status=err[1])

        # Return ML result WITHOUT saving to database
        # Frontend will save when user clicks "Save & Continue"
        return Response(ml_data, status=status.HTTP_200_OK)

    # ── GET /  list ───────────────────────────────────────
    def list(self, request):
        qs = self.get_queryset()
        risk = request.query_params.get('risk')
        if risk:
            qs = qs.filter(risk_level=risk)
        return Response(AssessmentListSerializer(qs, many=True).data)

    # ── GET /{id}/ ────────────────────────────────────────
    def retrieve(self, request, pk=None):
        try:
            obj = self.get_queryset().get(pk=pk)
        except Assessment.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(AssessmentResultSerializer(obj).data)

    # ── DELETE /{id}/ ─────────────────────────────────────
    def destroy(self, request, pk=None):
        try:
            obj = self.get_queryset().get(pk=pk)
        except Assessment.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response({'message': 'Assessment deleted.'})

    # ── GET /symptoms/  — proxies ML /symptoms ────────────
    @action(detail=False, methods=['get'], url_path='symptoms')
    def symptoms(self, request):
        """
        Returns all symptoms with severity weights from Symptom-severity.csv.
        Response: { symptoms: [...], symptoms_detail: [{name, severity},...], total }
        """
        data, err = call_ml('/symptoms')
        if err:
            return Response({'error': err[0]}, status=err[1])
        return Response(data)

    # ── GET /diseases/  — proxies ML /diseases ────────────
    @action(detail=False, methods=['get'], url_path='diseases')
    def diseases(self, request):
        """
        Returns all diseases with descriptions and precautions.
        Response: { diseases:[...], diseases_detail:[{name,description,precautions},...], total }
        """
        data, err = call_ml('/diseases')
        if err:
            return Response({'error': err[0]}, status=err[1])
        return Response(data)

    # ── GET /disease/{name}/ ─────────────────────────────
    @action(detail=False, methods=['get'], url_path='disease/(?P<name>[^/.]+)')
    def disease_detail(self, request, name=None):
        """
        Single disease: description + precautions.
        Example: GET /api/symptoms/assessments/disease/Diabetes/
        """
        data, err = call_ml(f'/disease/{name}')
        if err:
            return Response({'error': err[0]}, status=err[1])
        return Response(data)