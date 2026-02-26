from rest_framework import serializers
from .models import SystemSettings
from apps.authentication.models import User


# ── Settings Section Serializers ──

class AlertThresholdSerializer(serializers.ModelSerializer):
    """Serializer for alert threshold settings."""
    class Meta:
        model = SystemSettings
        fields = [
            'suspicious_traffic_threshold',
            'port_scan_limit',
            'failed_login_limit',
            'packet_size_threshold',
            'monitoring_window_minutes',
        ]


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notification settings."""
    class Meta:
        model = SystemSettings
        fields = [
            'email_alerts_enabled',
            'sms_alerts_enabled',
            'admin_email',
            'alert_severity_filter',
        ]


class FirewallDefaultsSerializer(serializers.ModelSerializer):
    """Serializer for firewall default settings."""
    class Meta:
        model = SystemSettings
        fields = [
            'default_action',
            'log_blocked_traffic',
            'auto_block_suspicious_ip',
        ]


class SecuritySettingsSerializer(serializers.ModelSerializer):
    """Serializer for security settings."""
    class Meta:
        model = SystemSettings
        fields = [
            'session_timeout_minutes',
            'log_retention_days',
            'two_factor_enabled',
            'live_monitoring_enabled',
        ]


# ── User Management Serializers ──

class UserManagementSerializer(serializers.ModelSerializer):
    """Serializer for user management (admin view)."""
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role',
            'is_active', 'last_login', 'created_at',
        ]
        read_only_fields = ['id', 'last_login', 'created_at']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new user via admin panel."""
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'is_active']
        read_only_fields = ['id']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing a user's password (admin action)."""
    new_password = serializers.CharField(min_length=8, write_only=True)
