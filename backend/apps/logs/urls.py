from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NetworkLogViewSet

router = DefaultRouter()
router.register(r'', NetworkLogViewSet, basename='logs')

urlpatterns = [
    path('', include(router.urls)),
]



