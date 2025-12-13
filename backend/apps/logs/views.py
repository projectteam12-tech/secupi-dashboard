from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import NetworkLog
from .serializers import NetworkLogSerializer
from apps.authentication.permissions import IsAdminOrReadOnly
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


class NetworkLogViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing network logs.
    """
    queryset = NetworkLog.objects.all()
    serializer_class = NetworkLogSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['src_ip', 'dst_ip', 'proto', 'action']
    search_fields = ['src_ip', 'dst_ip']
    ordering_fields = ['timestamp', 'created_at', 'packet_size']
    ordering = ['-timestamp']
    
    def create(self, request, *args, **kwargs):
        """
        Create a new log entry and broadcast it via WebSocket.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Broadcast to WebSocket clients
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                'logs',
                {
                    'type': 'log_message',
                    'message': serializer.data
                }
            )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)



