from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class FirewallRule(models.Model):
    """
    Model to store firewall rules that can trigger responses to ESP32 hardware.
    """
    PROTO_CHOICES = [
        ('TCP', 'TCP'),
        ('UDP', 'UDP'),
        ('ICMP', 'ICMP'),
        ('*', 'All'),
    ]
    
    ACTION_CHOICES = [
        ('allow', 'Allow'),
        ('block', 'Block'),
        ('drop', 'Drop'),
    ]
    
    name = models.CharField(max_length=255)
    src = models.CharField(max_length=255, help_text='Source IP or CIDR (use * for all)')
    dst = models.CharField(max_length=255, help_text='Destination IP or CIDR (use * for all)')
    proto = models.CharField(max_length=10, choices=PROTO_CHOICES, default='*')
    port = models.CharField(max_length=50, help_text='Port number or range (use * for all)')
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='firewall_rules')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'firewall_rules'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.src} -> {self.dst})"



