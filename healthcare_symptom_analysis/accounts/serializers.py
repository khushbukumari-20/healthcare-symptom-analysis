from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import Group
from .models import User, MedicalHistory, Allergy, Medication, Doctor


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    doctor_profile = DoctorSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email','role', 'first_name', 'last_name', 'phone', 
                  'age', 'gender', 'weight', 'height', 'blood_type', 'created_at', 'bmi','doctor_profile']
        read_only_fields = ['id', 'created_at', 'bmi']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)


    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'first_name',
            'last_name',
            'password',
            'password_confirm',
            'phone',
            'age',
            'gender',
            'weight',
            'height',
            'blood_type',
            'role'
        ]
 
    def validate_phone(self, value):
        """Validate phone number if provided"""
        if value:  # Only validate if phone is provided
            # Check if phone already exists
            if User.objects.filter(phone=value).exists():
                raise serializers.ValidationError("This phone number is already registered")
        return value
 
    def validate_email(self, value):
        """Validate email uniqueness"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered")
        return value
 
    def validate_username(self, value):
        """Validate username uniqueness"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken")
        return value
 
    def validate(self, data):
        """Validate password confirmation"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                "password_confirm": "Passwords do not match"
            })
        
        return data
 

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        role = validated_data.get('role', 'patient')

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        role_to_group = {
            'doctor': 'doctor',
            'patient': 'patient',
            'nurse': 'nurse',
        }
        group_name = role_to_group.get(role, 'patient')
        try:
            group = Group.objects.get(name=group_name)
            user.groups.add(group)
        except Group.DoesNotExist:
            pass

        if role == 'doctor':
            from .models import Doctor
            try:
                Doctor.objects.create(
                    user=user,
                    doctor_name=user.get_full_name() or user.username,
                    email=user.email,
                    phone=user.phone or f'TBD_{user.id}',
                    gender=user.gender or '',
                    specialization='General Physician',
                    qualification='MBBS',
                    experience=0,
                    hospital_name='Not specified',
                )
            except Exception as e:
                print(f"❌ Doctor profile creation failed: {str(e)}")

        return user



class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        """Authenticate user with username and password"""
        user = authenticate(
            username=data['username'],
            password=data['password']
        )
 
        if not user:
            raise serializers.ValidationError(
                "Invalid username or password"
            )
 
        data['user'] = user
        return data

class MedicalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = MedicalHistory
        fields = ['id', 'condition_name', 'diagnosis_date', 'status',
                  'notes', 'history_type', 'parent_relation', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class AllergySerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergy
        fields = ['id', 'allergen', 'severity', 'reaction', 'created_at']
        read_only_fields = ['id', 'created_at']



class MedicationSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='user.get_full_name', read_only=True)
    prescribed_by_name = serializers.SerializerMethodField()
    prescribed_by_specialization = serializers.CharField(
        source='prescribed_by.specialization', 
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = Medication
        fields = [
            'id', 'user', 'patient_name', 'medicine_name', 'dosage', 
            'frequency', 'start_date', 'end_date', 'reason', 'status', 
            'notes', 'prescribed_by', 'prescribed_by_name', 
            'prescribed_by_specialization', 'created_at'
        ]
        read_only_fields = ['created_at', 'user']
    
    def get_prescribed_by_name(self, obj):
        if obj.prescribed_by:
            return obj.prescribed_by.doctor_name
        return None
    
    def validate_prescribed_by(self, value):
        return value


class UserDetailSerializer(serializers.ModelSerializer):
    medical_history = MedicalHistorySerializer(many=True, read_only=True)
    allergies = AllergySerializer(many=True, read_only=True)
    medications = MedicationSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 
                  'age', 'gender', 'weight', 'height', 'blood_type', 'bmi',
                  'medical_history', 'allergies', 'medications', 'created_at']
        read_only_fields = ['id', 'created_at', 'bmi']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
 
    def validate(self, data):
        """Validate password change"""
        if data['new_password'] != data['password_confirm']:
            raise serializers.ValidationError({
                "password_confirm": "New passwords do not match"
            })
        
        if data['old_password'] == data['new_password']:
            raise serializers.ValidationError({
                "new_password": "New password must be different from old password"
            })
        
        return data
 
    def validate_old_password(self, value):
        """Validate old password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value
 
    def save(self, user):
        """Change user password"""
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile view and update"""
    
    bmi = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    doctor_profile = DoctorSerializer(read_only=True)

 
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'role',
            'first_name',
            'last_name',
            'full_name',
            'phone',
            'age',
            'gender',
            'weight',
            'height',
            'blood_type',
            'bmi',
            'created_at',
            'updated_at',
            'doctor_profile'
        ]
        read_only_fields = ['id', 'username', 'email', 'created_at', 'updated_at']
 
    def get_bmi(self, obj):
        """Get BMI calculation"""
        return obj.bmi()
 
    def get_full_name(self, obj):
        """Get full name"""
        return obj.get_full_name()
 
 
class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'phone',
            'age',
            'gender',
            'weight',
            'height',
            'blood_type'
        ]


    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)

        if instance.role == 'doctor' and hasattr(instance, 'doctor_profile'):
            doctor = instance.doctor_profile
            doctor.doctor_name = f"{instance.first_name} {instance.last_name}".strip() or instance.username
            doctor.email = instance.email
            doctor.phone = instance.phone or doctor.phone
            doctor.gender = instance.gender
            doctor.save()

        return instance

 