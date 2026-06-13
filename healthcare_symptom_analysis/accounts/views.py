from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404

 
from .models import User, MedicalHistory, Allergy, Medication, Doctor
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
    MedicalHistorySerializer,
    AllergySerializer,
    MedicationSerializer,
    DoctorSerializer
)
  
 
# ─────────────────────────────────────────────────────────
#  HELPER — generate JWT tokens for a user
# ─────────────────────────────────────────────────────────
def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
    }
 
 
# ─────────────────────────────────────────────────────────
#  USER VIEWSET
#  router.register(r'', UserViewSet, basename='user')
#
#  Endpoints produced:
#  POST   /api/users/register/         → register
#  POST   /api/users/login/            → login
#  POST   /api/users/logout/           → logout
#  POST   /api/users/refresh/          → refresh token
#  GET    /api/users/me/               → profile
#  PUT    /api/users/me/               → update profile
#  PATCH  /api/users/me/               → partial update
#  POST   /api/users/change-password/  → change password
# ─────────────────────────────────────────────────────────
 
class UserViewSet(viewsets.GenericViewSet):
    """
    All user-related actions as a single ViewSet.
    No list/retrieve/destroy — users only manage their own account.
    """
    queryset = User.objects.all()
 
    def get_permissions(self):
        public_actions = ['register', 'login', 'refresh']
        if self.action in public_actions:
            return [AllowAny()]
        return [IsAuthenticated()]
 
    def get_serializer_class(self):
        mapping = {
            'register':        UserRegistrationSerializer,
            'login':           UserLoginSerializer,
            'me':              UserProfileSerializer,
            'update_profile':  UserUpdateSerializer,
            'change_password': ChangePasswordSerializer,
        }
        return mapping.get(self.action, UserProfileSerializer)
 
    # ── POST /register/ ──────────────────────────────────
    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens(user)
            return Response(
                {
                    'message': 'User registered successfully.',
                    'user': UserProfileSerializer(user).data,
                    **tokens,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
    # ── POST /login/ ─────────────────────────────────────
    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = get_tokens(user)
            return Response(
                {
                    'message': 'Login successful.',
                    'user': UserProfileSerializer(user).data,
                    **tokens,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
    # ── POST /logout/ ────────────────────────────────────
    @action(detail=False, methods=['post'], url_path='logout')
    def logout(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response(
                {'message': 'Logout successful.'},
                status=status.HTTP_200_OK,
            )
        except Exception:
            # Even if blacklist fails, tell client to discard tokens
            return Response(
                {'message': 'Logged out.'},
                status=status.HTTP_200_OK,
            )
 
    # ── POST /refresh/ ───────────────────────────────────
    @action(detail=False, methods=['post'], url_path='refresh',
            permission_classes=[AllowAny])
    def refresh(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            return Response(
                {
                    'access':  str(token.access_token),
                    'refresh': str(token),
                },
                status=status.HTTP_200_OK,
            )
        except Exception:
            return Response(
                {'error': 'Invalid or expired refresh token.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
 
    # ── GET + PUT + PATCH /me/ ───────────────────────────

    @action(detail=False, methods=['get', 'put', 'patch'], url_path='me')
    def me(self, request):
        user = request.user

        if request.method == 'GET':
            serializer = UserProfileSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)

        partial = request.method == 'PATCH'
        serializer = UserUpdateSerializer(user, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    'message': 'Profile updated successfully.',
                    'user': UserProfileSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # ── POST /change-password/ ───────────────────────────
    @action(detail=False, methods=['post'], url_path='change-password')
    def change_password(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request},
        )
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(
                {'message': 'Password changed successfully.'},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # patient list 
    @action(detail=False, methods=['get'], url_path='patients')
    def patients(self, request):
        """Returns all patients — doctors only."""
        if request.user.role != 'doctor':
            return Response(
                {'error': 'Only doctors can view patients.'},
                status=status.HTTP_403_FORBIDDEN
            )

        patients = User.objects.filter(role='patient').values(
            'id', 'first_name', 'last_name', 'username', 'email'
        )
        return Response(list(patients), status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='me/doctor')
    def current_doctor(self, request):
        if request.user.role != 'doctor':
            return Response(
                {'error': 'Not a doctor.'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            doctor = request.user.doctor_profile  # ✅ direct FK lookup
            return Response({
                'id':             doctor.id,
                'doctor_name':    doctor.doctor_name,
                'specialization': doctor.specialization,
                'email':          doctor.email,
            }, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {'error': 'Doctor profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

    


# ─────────────────────────────────────────────────────────
#  MEDICAL HISTORY VIEWSET
#  router.register(r'medical-history', MedicalHistoryViewSet, basename='medical-history')
#
#  Endpoints produced:
#  GET    /api/users/medical-history/        → list
#  POST   /api/users/medical-history/        → create
#  GET    /api/users/medical-history/{id}/   → retrieve
#  PUT    /api/users/medical-history/{id}/   → update
#  PATCH  /api/users/medical-history/{id}/   → partial update
#  DELETE /api/users/medical-history/{id}/   → destroy
# ─────────────────────────────────────────────────────────
 
class MedicalHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = MedicalHistory.objects.filter(user=self.request.user)
        history_type = self.request.query_params.get('type')
        if history_type in ('patient', 'family'):
            qs = qs.filter(history_type=history_type)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Medical history record deleted.'},
            status=status.HTTP_200_OK
        )


# ─────────────────────────────────────────────────────────
#  ALLERGY VIEWSET
#  router.register(r'allergies', AllergyViewSet, basename='allergy')
#
#  Endpoints produced:
#  GET    /api/users/allergies/        → list
#  POST   /api/users/allergies/        → create
#  GET    /api/users/allergies/{id}/   → retrieve
#  PUT    /api/users/allergies/{id}/   → update
#  PATCH  /api/users/allergies/{id}/   → partial update
#  DELETE /api/users/allergies/{id}/   → destroy
# ─────────────────────────────────────────────────────────
 
class AllergyViewSet(viewsets.ModelViewSet):
    """
    CRUD for the authenticated user's allergies.
    Users can only see and manage their own records.
    """
    serializer_class   = AllergySerializer
    permission_classes = [IsAuthenticated]
 
    def get_queryset(self):
        return Allergy.objects.filter(user=self.request.user)
 
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
 
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Allergy record deleted.'},
            status=status.HTTP_200_OK,
        )
 
 
# ─────────────────────────────────────────────────────────
#  MEDICATION VIEWSET
#  router.register(r'medications', MedicationViewSet, basename='medication')
#
#  Endpoints produced:
#  GET    /api/users/medications/        → list
#  POST   /api/users/medications/        → create
#  GET    /api/users/medications/{id}/   → retrieve
#  PUT    /api/users/medications/{id}/   → update
#  PATCH  /api/users/medications/{id}/   → partial update
#  DELETE /api/users/medications/{id}/   → destroy
# ─────────────────────────────────────────────────────────



class MedicationViewSet(viewsets.ModelViewSet):
    """
    CRUD for medications.
    - Patients: can only see/create their own medications
    - Doctors: can see all medications, create for any patient, edit/delete any medication
    """
    serializer_class = MedicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Doctors can see all medications
        if user.role == 'doctor':
            return Medication.objects.all().select_related('user', 'prescribed_by')
        
        # Patients can only see their own medications
        return Medication.objects.filter(user=user).select_related('prescribed_by')
    
    def perform_create(self, serializer):
        user = self.request.user

        if user.role == 'doctor':
            patient_id = self.request.data.get('patient')
            if patient_id:
                try:
                    patient = User.objects.get(id=patient_id, role='patient')
                    serializer.save(user=patient)  # ✅ prescribed_by comes from frontend
                except User.DoesNotExist:
                    raise serializers.ValidationError({"patient": "Patient not found"})
            else:
                serializer.save(user=user)  # ✅ no prescribed_by override
        else:
            serializer.save(user=user)  # ✅ no prescribed_by override

    def update(self, request, *args, **kwargs):
        # Only doctors can update medications
        user = self.request.user
        if user.role != 'doctor':
            return Response(
                {'error': 'Only doctors can update medications.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        # Only doctors can delete medications
        user = self.request.user
        if user.role != 'doctor':
            return Response(
                {'error': 'Only doctors can delete medications.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Medication record deleted.'},
            status=status.HTTP_200_OK
        )

 
class DoctorViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = Doctor.objects.filter(available=True)

    serializer_class = DoctorSerializer

    permission_classes = [IsAuthenticated]



@login_required
def doctor_chat(request):
    if request.user.role != "doctor":
        return JsonResponse({"error": "Access denied"}, status=403)
    
    query = request.POST.get("query")
    patient_id = request.POST.get("patient_id", None)
    if patient_id:
        patient_id = int(patient_id)
    
    rag = get_doctor_rag_instance(groq_api_key=os.getenv("GROQ_API_KEY"))
    
    # Pass doctor_user and patient_id
    response = rag.chat(
        query=query,
        doctor_user=request.user,
        patient_id=patient_id
    )
    
    return JsonResponse({"response": response})

@require_http_methods(["GET"])
def search_doctors(request):
    """
    Search doctors by specialization
    GET /api/doctors/search/?specialization=cardiologist
    
    No authentication required (public endpoint)
    """
    specialization = request.GET.get('specialization', None)
    available_only = request.GET.get('available', 'true').lower() == 'true'
    
    doctors = Doctor.objects.all()
    
    if available_only:
        doctors = doctors.filter(available=True)
    
    if specialization:
        doctors = doctors.filter(specialization__icontains=specialization)
    
    doctor_list = [
        {
            'id': d.id,
            'name': f"Dr. {d.doctor_name}",
            'specialization': d.specialization,
            'qualification': d.qualification,
            'experience': d.experience,
            'hospital': d.hospital_name,
            'phone': d.phone,
            'email': d.email,
            'consultation_fee': str(d.consultation_fee) if d.consultation_fee else "NA",
            'available': d.available
        }
        for d in doctors[:10]  # Limit to 10 doctors
    ]
    
    return JsonResponse({
        'doctors': doctor_list,
        'count': len(doctor_list)
    })



class DoctorProfileViewSet(viewsets.ModelViewSet):
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Doctor.objects.filter(user=self.request.user)


    @action(detail=False, methods=['get', 'patch'], url_path='me')
    def me(self, request):
        doctor = get_object_or_404(Doctor, user=request.user)

        if request.method == 'GET':
            return Response(self.get_serializer(doctor).data)

        serializer = self.get_serializer(doctor, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)