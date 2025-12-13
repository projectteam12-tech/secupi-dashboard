from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Alert(models.Model):
    """
    Model to store security alerts.
    """
    ALERT_TYPE_CHOICES = [
        ('port_scan', 'Port Scan'),
        ('brute_force', 'Brute Force'),
        ('ddos', 'DDoS Attack'),
        ('malware', 'Malware Detection'),
        ('suspicious_traffic', 'Suspicious Traffic'),
        ('unauthorized_access', 'Unauthorized Access'),
        ('other', 'Other'),
    ]
    
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('resolved', 'Resolved'),
        ('ignored', 'Ignored'),
    ]
    
    alert_type = models.CharField(max_length=50, choices=ALERT_TYPE_CHOICES, db_index=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, db_index=True)
    src_ip = models.GenericIPAddressField(db_index=True)
    dst_ip = models.GenericIPAddressField(null=True, blank=True, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open', db_index=True)
    message = models.TextField()
    metadata = models.JSONField(null=True, blank=True, help_text='Additional alert metadata')
    resolved_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='resolved_alerts')
    resolved_at = models.DateTimeField(null=True, blank=True)
    timestamp = models.DateTimeField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'alerts'
        ordering = ['-timestamp', '-created_at']
        indexes = [
            models.Index(fields=['status', 'severity']),
            models.Index(fields=['alert_type']),
            models.Index(fields=['timestamp']),
        ]
    
    def __str__(self):
        return f"{self.alert_type} - {self.severity} ({self.src_ip})"



