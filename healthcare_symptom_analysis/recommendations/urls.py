from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RecommendationViewSet,DoctorSuggestionViewSet

router = DefaultRouter()
router.register(r'doctor-suggestions', DoctorSuggestionViewSet,  basename='doctor-suggestions')
router.register(r'', RecommendationViewSet, basename='recommendation')


urlpatterns = [
    path('', include(router.urls)),
]
