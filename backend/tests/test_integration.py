import pytest
import json
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from channels.testing import WebsocketCommunicator
from apps.logs.models import NetworkLog
from apps.logs.consumers import LogConsumer

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
@pytest.mark.asyncio
class TestWebSocketIntegration:
    async def test_log_websocket_receives_updates(self, api_client, admin_user):
        """
        Integration test: Post a log via API and verify WebSocket client receives it.
        """
        # Connect WebSocket client
        communicator = WebsocketCommunicator(LogConsumer.as_asgi(), "/ws/logs/")
        connected, subprotocol = await communicator.connect()
        assert connected
        
        # Post a log via API
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
        
        # Wait for WebSocket message (with timeout)
        try:
            message = await communicator.receive_json_from(timeout=5.0)
            assert message['type'] == 'log'
            assert 'data' in message
            assert message['data']['src_ip'] == '192.168.1.50'
        except Exception as e:
            pytest.fail(f"WebSocket did not receive message: {e}")
        finally:
            await communicator.disconnect()



