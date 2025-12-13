from rest_framework import serializers
from .models import FirewallRule
from apps.authentication.serializers import UserSerializer


class FirewallRuleSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = FirewallRule
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by')



