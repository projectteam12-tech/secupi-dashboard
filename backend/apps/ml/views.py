from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from .models import MLModel, Report
from .serializers import MLModelSerializer, ReportSerializer
from apps.authentication.permissions import IsAdmin


class MLModelViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing ML models.
    Only admins can manage ML models.
    """
    queryset = MLModel.objects.all()
    serializer_class = MLModelSerializer
    permission_classes = [IsAdmin]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['is_active']
    ordering_fields = ['uploaded_at']
    ordering = ['-uploaded_at']
    
    @action(detail=True, methods=['post'])
    def retrain(self, request, pk=None):
        """
        Trigger model retraining (placeholder for Celery task).
        """
        model = self.get_object()
        # TODO: Implement Celery task for model retraining
        return Response({
            'message': f'Retraining triggered for {model.name} v{model.version}',
            'status': 'queued'
        }, status=status.HTTP_202_ACCEPTED)


class ReportViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing reports.
    """
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['report_type']
    ordering_fields = ['created_at']
    ordering = ['-created_at']



