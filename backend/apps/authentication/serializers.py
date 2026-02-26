from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'is_active', 'last_login', 'created_at')
        read_only_fields = ('id', 'last_login', 'created_at')


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include username and password')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    admin_key = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'role', 'admin_key')
        extra_kwargs = {
            'email': {'required': True},
            'role': {'default': 'observer'}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match'})
        
        # Validate admin registration
        role = attrs.get('role', 'observer')
        admin_key = attrs.get('admin_key', '')
        
        if role == 'admin':
            # Check if admin key is provided and valid
            from django.conf import settings
            expected_key = getattr(settings, 'ADMIN_REGISTRATION_KEY', 'admin-secret-key-change-in-production')
            if admin_key != expected_key:
                raise serializers.ValidationError({
                    'admin_key': 'Invalid admin registration key. Admin accounts require a valid registration key.'
                })
        
        # Remove admin_key from attrs as it's not a model field
        attrs.pop('admin_key', None)
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')
        role = validated_data.pop('role', 'observer')
        user = User.objects.create_user(
            role=role,
            **validated_data
        )
        user.set_password(password)
        user.save()
        return user


class TokenSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()


