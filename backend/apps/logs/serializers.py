from rest_framework import serializers
from .models import NetworkLog


class NetworkLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = NetworkLog
        fields = '__all__'
        read_only_fields = ('created_at',)
    
    def validate(self, data):
        # Ensure timestamp is provided
        if 'timestamp' not in data:
            raise serializers.ValidationError({'timestamp': 'Timestamp is required'})
        return data



