from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import FirewallRule
from .serializers import FirewallRuleSerializer
from apps.authentication.permissions import IsAdmin


class FirewallRuleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing firewall rules.
    Only admins can manage firewall rules.
    """
    queryset = FirewallRule.objects.all()
    serializer_class = FirewallRuleSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['action', 'proto', 'is_active']
    search_fields = ['name', 'src', 'dst']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)



