from rest_framework import serializers
from .models import Alert
from apps.authentication.serializers import UserSerializer


class AlertSerializer(serializers.ModelSerializer):
    resolved_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Alert
        fields = '__all__'
        read_only_fields = ('created_at', 'resolved_by', 'resolved_at')
    
    def validate(self, data):
        if 'timestamp' not in data:
            raise serializers.ValidationError({'timestamp': 'Timestamp is required'})
        return data



