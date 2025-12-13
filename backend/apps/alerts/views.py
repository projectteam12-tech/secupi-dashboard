from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from .models import Alert
from .serializers import AlertSerializer
from apps.authentication.permissions import IsAdminOrReadOnly
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


class AlertViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing alerts.
    """
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['alert_type', 'severity', 'status', 'src_ip', 'dst_ip']
    search_fields = ['message', 'src_ip', 'dst_ip']
    ordering_fields = ['timestamp', 'created_at', 'severity']
    ordering = ['-timestamp']
    
    def create(self, request, *args, **kwargs):
        """
        Create a new alert and broadcast it via WebSocket.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Broadcast to WebSocket clients
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                'alerts',
                {
                    'type': 'alert_message',
                    'message': serializer.data
                }
            )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=True, methods=['patch'])
    def resolve(self, request, pk=None):
        """
        Resolve an alert.
        """
        alert = self.get_object()
        alert.status = 'resolved'
        alert.resolved_by = request.user
        alert.resolved_at = timezone.now()
        alert.save()
        
        serializer = self.get_serializer(alert)
        return Response(serializer.data, status=status.HTTP_200_OK)



