import csv
from io import StringIO
from datetime import datetime

from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.authentication.permissions import IsAdmin
from apps.authentication.models import User
from apps.logs.models import NetworkLog
from apps.alerts.models import Alert

from .models import SystemSettings
from .serializers import (
    AlertThresholdSerializer,
    NotificationSerializer,
    FirewallDefaultsSerializer,
    SecuritySettingsSerializer,
    UserManagementSerializer,
    UserCreateSerializer,
    ChangePasswordSerializer,
)


# ─────────────────────────────────────────────
# Generic helper: GET / PUT for a settings section
# ─────────────────────────────────────────────

def _settings_view(request, serializer_class):
    """
    Shared logic for GET (read) and PUT (update) of a settings section.
    Always operates on the singleton SystemSettings row.
    """
    settings_obj = SystemSettings.load()

    if request.method == 'GET':
        serializer = serializer_class(settings_obj)
        return Response(serializer.data)

    # PUT / PATCH
    serializer = serializer_class(settings_obj, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────
# Settings Section Endpoints
# ─────────────────────────────────────────────

@api_view(['GET', 'PUT'])
@permission_classes([IsAdmin])
def alert_thresholds(request):
    """GET / PUT alert threshold settings."""
    return _settings_view(request, AlertThresholdSerializer)


@api_view(['GET', 'PUT'])
@permission_classes([IsAdmin])
def notification_settings(request):
    """GET / PUT notification settings."""
    return _settings_view(request, NotificationSerializer)


@api_view(['GET', 'PUT'])
@permission_classes([IsAdmin])
def firewall_defaults(request):
    """GET / PUT firewall default settings."""
    return _settings_view(request, FirewallDefaultsSerializer)


@api_view(['GET', 'PUT'])
@permission_classes([IsAdmin])
def security_settings(request):
    """GET / PUT security settings."""
    return _settings_view(request, SecuritySettingsSerializer)


# ─────────────────────────────────────────────
# User Management ViewSet (Admin only)
# ─────────────────────────────────────────────

class UserManagementViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for user accounts.
    Only accessible by admins.
    """
    queryset = User.objects.all().order_by('-created_at')
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserManagementSerializer

    @action(detail=True, methods=['patch'], url_path='change-password')
    def change_password(self, request, pk=None):
        """Admin endpoint to change any user's password."""
        user = self.get_object()
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password updated successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        """Enable / disable a user account."""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({
            'message': f"User {'enabled' if user.is_active else 'disabled'}",
            'is_active': user.is_active,
        })


# ─────────────────────────────────────────────
# Export & Reports
# ─────────────────────────────────────────────

def _parse_date_range(request):
    """Parse optional start_date / end_date query params."""
    start = request.query_params.get('start_date')
    end = request.query_params.get('end_date')
    filters = {}
    if start:
        filters['timestamp__gte'] = start
    if end:
        filters['timestamp__lte'] = end
    return filters


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_logs(request):
    """Export network logs as CSV with optional date range."""
    date_filters = _parse_date_range(request)
    logs = NetworkLog.objects.filter(**date_filters).order_by('-timestamp')

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="network_logs.csv"'

    writer = csv.writer(response)
    writer.writerow(['Timestamp', 'Source IP', 'Destination IP', 'Protocol', 'Packet Size', 'Action'])
    for log in logs:
        writer.writerow([log.timestamp, log.src_ip, log.dst_ip, log.proto, log.packet_size, log.action])

    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_alerts(request):
    """Export alerts as CSV with optional date range."""
    date_filters = _parse_date_range(request)
    alerts = Alert.objects.filter(**date_filters).order_by('-timestamp')

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="alerts.csv"'

    writer = csv.writer(response)
    writer.writerow(['Timestamp', 'Type', 'Severity', 'Source IP', 'Destination IP', 'Status', 'Message'])
    for alert in alerts:
        writer.writerow([
            alert.timestamp, alert.alert_type, alert.severity,
            alert.src_ip, alert.dst_ip, alert.status, alert.message,
        ])

    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def summary_report(request):
    """Generate a summary report with key metrics."""
    date_filters = _parse_date_range(request)

    total_logs = NetworkLog.objects.filter(**date_filters).count()
    total_alerts = Alert.objects.filter(**date_filters).count()
    open_alerts = Alert.objects.filter(status='open', **date_filters).count()
    resolved_alerts = Alert.objects.filter(status='resolved', **date_filters).count()

    # Severity breakdown
    severity_counts = {}
    for sev in ['low', 'medium', 'high', 'critical']:
        severity_counts[sev] = Alert.objects.filter(severity=sev, **date_filters).count()

    # Protocol breakdown
    protocol_counts = {}
    for proto in ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS']:
        protocol_counts[proto] = NetworkLog.objects.filter(proto=proto, **date_filters).count()

    # Action breakdown
    action_counts = {}
    for act in ['allow', 'block', 'drop']:
        action_counts[act] = NetworkLog.objects.filter(action=act, **date_filters).count()

    return Response({
        'total_logs': total_logs,
        'total_alerts': total_alerts,
        'open_alerts': open_alerts,
        'resolved_alerts': resolved_alerts,
        'severity_breakdown': severity_counts,
        'protocol_breakdown': protocol_counts,
        'action_breakdown': action_counts,
        'generated_at': timezone.now().isoformat(),
    })
