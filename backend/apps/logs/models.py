from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class NetworkLog(models.Model):
    """
    Model to store network logs ingested from Raspberry Pi agents.
    """
    PROTO_CHOICES = [
        ('TCP', 'TCP'),
        ('UDP', 'UDP'),
        ('ICMP', 'ICMP'),
        ('HTTP', 'HTTP'),
        ('HTTPS', 'HTTPS'),
        ('OTHER', 'OTHER'),
    ]
    
    ACTION_CHOICES = [
        ('allow', 'Allow'),
        ('block', 'Block'),
        ('drop', 'Drop'),
    ]
    
    timestamp = models.DateTimeField(db_index=True)
    src_ip = models.GenericIPAddressField(db_index=True)
    dst_ip = models.GenericIPAddressField(db_index=True)
    proto = models.CharField(max_length=10, choices=PROTO_CHOICES)
    packet_size = models.IntegerField()
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    raw_json = models.JSONField(null=True, blank=True, help_text='Additional raw log data')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'network_logs'
        ordering = ['-timestamp', '-created_at']
        indexes = [
            models.Index(fields=['timestamp']),
            models.Index(fields=['src_ip']),
            models.Index(fields=['dst_ip']),
        ]
    
    def __str__(self):
        return f"{self.src_ip} -> {self.dst_ip} ({self.proto}) - {self.action}"



