# from django.urls import path

# from .views import (
#     RegisterView,
#     LoginView,
#     UserProfileView,
#     UpdateProfileView
# )

# urlpatterns = [

#     path('register/',RegisterView.as_view(),name='register'),
#     path('login/',LoginView.as_view(),name='login'),
#     path('me/',UserProfileView.as_view(),name='profile'),
#     path('update_profile/',UpdateProfileView.as_view(),name='update-profile'),
# ]


from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, MedicalHistoryViewSet, AllergyViewSet, MedicationViewSet, DoctorViewSet,search_doctors, DoctorProfileViewSet

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')
router.register(r'medical-history', MedicalHistoryViewSet, basename='medical-history')
router.register(r'allergies', AllergyViewSet, basename='allergy')
router.register(r'medications', MedicationViewSet, basename='medication')
router.register(r'doctors', DoctorViewSet, basename='doctors')
router.register(r'doctor-profile', DoctorProfileViewSet, basename='doctor-profile')



urlpatterns = [
    path('', include(router.urls)),
    path('doctors/search/', search_doctors, name='search_doctors'),

]