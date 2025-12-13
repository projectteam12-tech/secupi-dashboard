import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

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


@pytest.fixture
def observer_user():
    return User.objects.create_user(
        username='testobserver',
        password='testpass123',
        role='observer'
    )


@pytest.mark.django_db
class TestAuthentication:
    def test_login_success(self, api_client, admin_user):
        response = api_client.post('/api/auth/login/', {
            'username': 'testadmin',
            'password': 'testpass123'
        })
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user' in response.data
    
    def test_login_invalid_credentials(self, api_client):
        response = api_client.post('/api/auth/login/', {
            'username': 'invalid',
            'password': 'wrong'
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_me_endpoint(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        response = api_client.get('/api/auth/me/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == 'testadmin'
        assert response.data['role'] == 'admin'



