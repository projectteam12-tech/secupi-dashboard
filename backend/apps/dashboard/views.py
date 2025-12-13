from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Sum, Q
from apps.logs.models import NetworkLog
from apps.alerts.models import Alert
from apps.firewall.models import FirewallRule
import time
import json
import os

# #region agent log
LOG_PATH = r'c:\Users\karth\OneDrive\Desktop\.cursor\debug.log'
def _log_debug(location, message, data=None, hypothesis_id=None):
    try:
        with open(LOG_PATH, 'a') as f:
            f.write(json.dumps({
                'sessionId': 'debug-session',
                'runId': 'perf-debug',
                'hypothesisId': hypothesis_id or 'A',
                'location': location,
                'message': message,
                'data': data or {},
                'timestamp': int(time.time() * 1000)
            }) + '\n')
    except: pass
# #endregion agent log


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def summary(request):
    """
    Get dashboard summary metrics.
    Optimized to reduce database queries.
    """
    start_time = time.time()
    # #region agent log
    _log_debug('dashboard/views.py:summary', 'Function entry', {'request_method': request.method}, 'A')
    # #endregion agent log
    
    now = timezone.now()
    last_24h = now - timedelta(hours=24)
    last_hour = now - timedelta(hours=1)
    last_5min = now - timedelta(minutes=5)
    
    # #region agent log
    query_start = time.time()
    # #endregion agent log
    # Optimize: Get all metrics in fewer queries using annotations
    from django.db.models import Count, Sum, Q
    
    # Combined query for alerts data
    alerts_data = Alert.objects.filter(
        timestamp__gte=last_24h
    ).aggregate(
        active_count=Count('id', filter=Q(status='open')),
        alerts_by_type=Count('id', filter=Q(timestamp__gte=last_24h))
    )
    
    # Get alerts by type using values() - more efficient
    alerts_by_type = list(
        Alert.objects.filter(timestamp__gte=last_24h)
        .values('alert_type')
        .annotate(count=Count('id'))
        .order_by('-count')
    )
    # #region agent log
    _log_debug('dashboard/views.py:summary', 'Alerts queries completed', {'duration_ms': (time.time() - query_start) * 1000}, 'A')
    # #endregion agent log
    
    # #region agent log
    query_start = time.time()
    # #endregion agent log
    # Active alerts count (optimized)
    active_alerts = Alert.objects.filter(status='open').count()
    # #region agent log
    _log_debug('dashboard/views.py:summary', 'Active alerts query', {'duration_ms': (time.time() - query_start) * 1000, 'result': active_alerts}, 'A')
    # #endregion agent log
    
    # #region agent log
    query_start = time.time()
    # #endregion agent log
    # Blocked IPs (from firewall rules) - this is fast, small table
    blocked_ips = FirewallRule.objects.filter(
        action__in=['block', 'drop'],
        is_active=True
    ).values_list('src', flat=True).distinct().count()
    # #region agent log
    _log_debug('dashboard/views.py:summary', 'Firewall query', {'duration_ms': (time.time() - query_start) * 1000, 'result': blocked_ips}, 'A')
    # #endregion agent log
    
    # #region agent log
    query_start = time.time()
    # #endregion agent log
    # Traffic metrics - combine into single query
    traffic_data = NetworkLog.objects.filter(
        timestamp__gte=last_hour
    ).aggregate(
        total_bytes=Sum('packet_size'),
        total_count=Count('id')
    )
    total_bytes = traffic_data['total_bytes'] or 0
    traffic_rate = total_bytes / 3600 if total_bytes else 0
    # #region agent log
    _log_debug('dashboard/views.py:summary', 'Traffic rate query', {'duration_ms': (time.time() - query_start) * 1000, 'total_bytes': total_bytes}, 'A')
    # #endregion agent log
    
    # #region agent log
    query_start = time.time()
    # #endregion agent log
    # Devices online - use distinct count (indexed on src_ip)
    devices_online = NetworkLog.objects.filter(
        timestamp__gte=last_5min
    ).values('src_ip').distinct().count()
    # #region agent log
    _log_debug('dashboard/views.py:summary', 'Devices online query', {'duration_ms': (time.time() - query_start) * 1000, 'result': devices_online}, 'A')
    # #endregion agent log
    
    # #region agent log
    query_start = time.time()
    # #endregion agent log
    # Traffic by protocol - single efficient query
    traffic_by_proto = list(
        NetworkLog.objects.filter(timestamp__gte=last_24h)
        .values('proto')
        .annotate(
            count=Count('id'),
            total_bytes=Sum('packet_size')
        )
        .order_by('-total_bytes')
    )
    # #region agent log
    _log_debug('dashboard/views.py:summary', 'Traffic by proto query', {'duration_ms': (time.time() - query_start) * 1000}, 'A')
    # #endregion agent log
    
    total_duration = (time.time() - start_time) * 1000
    # #region agent log
    _log_debug('dashboard/views.py:summary', 'Function exit', {'total_duration_ms': total_duration}, 'A')
    # #endregion agent log
    
    return Response({
        'active_alerts': active_alerts,
        'blocked_ips': blocked_ips,
        'traffic_rate': round(traffic_rate, 2),
        'devices_online': devices_online,
        'alerts_by_type': alerts_by_type,
        'traffic_by_proto': traffic_by_proto,
    })


@api_view(['GET'])
@permission_classes([])
def health(request):
    """
    Health check endpoint.
    """
    return Response({'status': 'ok'}, status=status.HTTP_200_OK)

