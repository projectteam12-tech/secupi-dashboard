#!/usr/bin/env python
"""
Seed script to create demo data for secuPi-dashboard.
Creates an admin user and seeds sample logs and alerts.
"""
import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'secupi.settings')
django.setup()

from apps.authentication.models import User
from apps.logs.models import NetworkLog
from apps.alerts.models import Alert
from apps.firewall.models import FirewallRule


def create_admin_user():
    """Create admin user if it doesn't exist."""
    username = 'admin'
    email = 'admin@secupi.local'
    password = 'admin123'
    
    if User.objects.filter(username=username).exists():
        print(f"User '{username}' already exists. Skipping creation.")
        return User.objects.get(username=username)
    
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        role='admin',
        is_staff=True,
        is_superuser=True
    )
    print(f"Created admin user: {username} / {password}")
    return user


def create_observer_user():
    """Create observer user if it doesn't exist."""
    username = 'observer'
    email = 'observer@secupi.local'
    password = 'observer123'
    
    if User.objects.filter(username=username).exists():
        print(f"User '{username}' already exists. Skipping creation.")
        return User.objects.get(username=username)
    
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        role='observer'
    )
    print(f"Created observer user: {username} / {password}")
    return user


def seed_logs(admin_user):
    """Seed sample network logs."""
    print("Seeding network logs...")
    
    base_time = timezone.now() - timedelta(hours=24)
    
    created = 0
    for i in range(50):  # Create 200 logs total
        sample_logs = [
            {
                'timestamp': base_time + timedelta(minutes=i*10),
                'src_ip': '192.168.1.50',
                'dst_ip': '8.8.8.8',
                'proto': 'TCP',
                'packet_size': 512,
                'action': 'allow',
            },
            {
                'timestamp': base_time + timedelta(minutes=i*10 + 1),
                'src_ip': '192.168.1.51',
                'dst_ip': '1.1.1.1',
                'proto': 'UDP',
                'packet_size': 1024,
                'action': 'allow',
            },
            {
                'timestamp': base_time + timedelta(minutes=i*10 + 2),
                'src_ip': '192.168.1.100',
                'dst_ip': '192.168.1.1',
                'proto': 'TCP',
                'packet_size': 64,
                'action': 'block',
            },
            {
                'timestamp': base_time + timedelta(minutes=i*10 + 3),
                'src_ip': '10.0.0.5',
                'dst_ip': '8.8.8.8',
                'proto': 'HTTPS',
                'packet_size': 2048,
                'action': 'allow',
            },
        ]
        for log_data in sample_logs:
            NetworkLog.objects.create(**log_data)
            created += 1
    
    print(f"Created {created} network logs")


def seed_alerts(admin_user):
    """Seed sample alerts."""
    print("Seeding alerts...")
    
    base_time = timezone.now() - timedelta(hours=12)
    sample_alerts = [
        {
            'alert_type': 'port_scan',
            'severity': 'high',
            'src_ip': '192.168.1.100',
            'dst_ip': '192.168.1.1',
            'message': 'Multiple SYN packets from same host detected',
            'timestamp': base_time + timedelta(minutes=30),
            'status': 'open',
        },
        {
            'alert_type': 'brute_force',
            'severity': 'critical',
            'src_ip': '10.0.0.50',
            'dst_ip': '192.168.1.10',
            'message': 'Repeated failed login attempts detected',
            'timestamp': base_time + timedelta(hours=1),
            'status': 'open',
        },
        {
            'alert_type': 'suspicious_traffic',
            'severity': 'medium',
            'src_ip': '192.168.1.75',
            'dst_ip': '203.0.113.1',
            'message': 'Unusual traffic pattern detected',
            'timestamp': base_time + timedelta(hours=2),
            'status': 'resolved',
            'resolved_by': admin_user,
            'resolved_at': base_time + timedelta(hours=2, minutes=15),
        },
        {
            'alert_type': 'ddos',
            'severity': 'critical',
            'src_ip': '172.16.0.100',
            'message': 'Potential DDoS attack detected from multiple sources',
            'timestamp': base_time + timedelta(hours=3),
            'status': 'open',
        },
    ]
    
    created = 0
    for alert_data in sample_alerts:
        Alert.objects.create(**alert_data)
        created += 1
    
    print(f"Created {created} alerts")


def seed_firewall_rules(admin_user):
    """Seed sample firewall rules."""
    print("Seeding firewall rules...")
    
    sample_rules = [
        {
            'name': 'Block Suspicious IP',
            'src': '192.168.1.100',
            'dst': '*',
            'proto': '*',
            'port': '*',
            'action': 'block',
            'created_by': admin_user,
            'is_active': True,
        },
        {
            'name': 'Allow DNS Traffic',
            'src': '*',
            'dst': '8.8.8.8',
            'proto': 'UDP',
            'port': '53',
            'action': 'allow',
            'created_by': admin_user,
            'is_active': True,
        },
        {
            'name': 'Block External SSH',
            'src': '*',
            'dst': '*',
            'proto': 'TCP',
            'port': '22',
            'action': 'block',
            'created_by': admin_user,
            'is_active': False,
        },
    ]
    
    created = 0
    for rule_data in sample_rules:
        FirewallRule.objects.create(**rule_data)
        created += 1
    
    print(f"Created {created} firewall rules")


def main():
    """Main seeding function."""
    print("=" * 50)
    print("Seeding secuPi-dashboard demo data")
    print("=" * 50)
    
    admin_user = create_admin_user()
    observer_user = create_observer_user()
    
    seed_logs(admin_user)
    seed_alerts(admin_user)
    seed_firewall_rules(admin_user)
    
    print("=" * 50)
    print("Seeding completed!")
    print("=" * 50)
    print("\nDefault credentials:")
    print("  Admin: admin / admin123")
    print("  Observer: observer / observer123")
    print("\n⚠️  Please change these passwords after first login!")


if __name__ == '__main__':
    main()


