from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MLModelViewSet, ReportViewSet

router = DefaultRouter()
router.register(r'models', MLModelViewSet, basename='ml-models')
router.register(r'reports', ReportViewSet, basename='reports')

urlpatterns = [
    path('', include(router.urls)),
]



