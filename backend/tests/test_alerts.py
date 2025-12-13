import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from apps.alerts.models import Alert

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user():
    return User.objects.create_user(
        username='testadmin',
        password='testpass123',
        role='admin'
    )


@pytest.mark.django_db
class TestAlertsAPI:
    def test_create_alert(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        alert_data = {
            'alert_type': 'port_scan',
            'severity': 'high',
            'src_ip': '192.168.1.100',
            'message': 'Multiple SYN packets detected',
            'timestamp': timezone.now().isoformat()
        }
        response = api_client.post('/api/alerts/', alert_data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert Alert.objects.count() == 1
    
    def test_resolve_alert(self, api_client, admin_user):
        alert = Alert.objects.create(
            alert_type='port_scan',
            severity='high',
            src_ip='192.168.1.100',
            message='Test alert',
            timestamp=timezone.now(),
            status='open'
        )
        
        api_client.force_authenticate(user=admin_user)
        response = api_client.patch(f'/api/alerts/{alert.id}/resolve/')
        assert response.status_code == status.HTTP_200_OK
        alert.refresh_from_db()
        assert alert.status == 'resolved'
        assert alert.resolved_by == admin_user



