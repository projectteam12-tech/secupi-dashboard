from django.db import models


class SystemSettings(models.Model):
    """
    Singleton model to store all system-wide settings.
    Only one row should exist — enforced by the save() override.
    """

    # ── Alert Threshold Settings ──
    suspicious_traffic_threshold = models.IntegerField(
        default=100,
        help_text='Max requests per minute before flagging as suspicious'
    )
    port_scan_limit = models.IntegerField(
        default=20,
        help_text='Number of port scans to trigger alert'
    )
    failed_login_limit = models.IntegerField(
        default=5,
        help_text='Failed login attempts before lockout/alert'
    )
    packet_size_threshold = models.IntegerField(
        default=10000,
        help_text='Packet size (bytes) threshold for alerts'
    )
    monitoring_window_minutes = models.IntegerField(
        default=5,
        help_text='Time window (minutes) for threshold evaluation'
    )

    # ── Notification Settings ──
    email_alerts_enabled = models.BooleanField(default=True)
    sms_alerts_enabled = models.BooleanField(default=False)
    admin_email = models.EmailField(
        default='admin@secupi.local',
        help_text='Email address for alert notifications'
    )
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    alert_severity_filter = models.CharField(
        max_length=20,
        choices=SEVERITY_CHOICES,
        default='medium',
        help_text='Minimum severity level to trigger notifications'
    )

    # ── Firewall Default Settings ──
    ACTION_CHOICES = [
        ('allow', 'Allow'),
        ('deny', 'Deny'),
    ]
    default_action = models.CharField(
        max_length=10,
        choices=ACTION_CHOICES,
        default='allow',
        help_text='Default firewall action for unmatched traffic'
    )
    log_blocked_traffic = models.BooleanField(
        default=True,
        help_text='Log all blocked/denied traffic'
    )
    auto_block_suspicious_ip = models.BooleanField(
        default=False,
        help_text='Automatically block IPs flagged as suspicious'
    )

    # ── Security Settings ──
    session_timeout_minutes = models.IntegerField(
        default=30,
        help_text='Session timeout duration in minutes'
    )
    log_retention_days = models.IntegerField(
        default=90,
        help_text='Number of days to retain logs'
    )
    two_factor_enabled = models.BooleanField(
        default=False,
        help_text='Enable two-factor authentication'
    )
    live_monitoring_enabled = models.BooleanField(
        default=True,
        help_text='Enable real-time traffic monitoring'
    )

    # ── Metadata ──
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_settings'
        verbose_name = 'System Settings'
        verbose_name_plural = 'System Settings'

    def __str__(self):
        return 'System Settings'

    def save(self, *args, **kwargs):
        """Enforce singleton: always use pk=1."""
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Prevent deletion of the singleton row."""
        pass

    @classmethod
    def load(cls):
        """Load (or create) the singleton settings instance."""
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
