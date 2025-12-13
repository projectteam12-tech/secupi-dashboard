import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from apps.logs.models import NetworkLog

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
class TestLogsAPI:
    def test_create_log(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        log_data = {
            'timestamp': timezone.now().isoformat(),
            'src_ip': '192.168.1.50',
            'dst_ip': '8.8.8.8',
            'proto': 'TCP',
            'packet_size': 512,
            'action': 'allow'
        }
        response = api_client.post('/api/logs/', log_data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert NetworkLog.objects.count() == 1
    
    def test_list_logs(self, api_client, admin_user):
        # Create some test logs
        NetworkLog.objects.create(
            timestamp=timezone.now(),
            src_ip='192.168.1.50',
            dst_ip='8.8.8.8',
            proto='TCP',
            packet_size=512,
            action='allow'
        )
        
        api_client.force_authenticate(user=admin_user)
        response = api_client.get('/api/logs/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
    
    def test_filter_logs_by_proto(self, api_client, admin_user):
        NetworkLog.objects.create(
            timestamp=timezone.now(),
            src_ip='192.168.1.50',
            dst_ip='8.8.8.8',
            proto='TCP',
            packet_size=512,
            action='allow'
        )
        NetworkLog.objects.create(
            timestamp=timezone.now(),
            src_ip='192.168.1.51',
            dst_ip='1.1.1.1',
            proto='UDP',
            packet_size=1024,
            action='allow'
        )
        
        api_client.force_authenticate(user=admin_user)
        response = api_client.get('/api/logs/?proto=TCP')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['proto'] == 'TCP'



