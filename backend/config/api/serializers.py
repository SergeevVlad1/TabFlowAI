from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Tab, TabGroup, TabSummary, TabSession, Task, User


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'priority', 'time', 'completed', 'estimatedTime', 'timeSpent', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password']
        read_only_fields = ['id']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered. Please login instead.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data, username=validated_data['email'])

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(**attrs)
        return user if user else False
    
class GoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField()

    def validate(self, attrs):
        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests as google_requests
        try:
            idinfo = google_id_token.verify_oauth2_token(attrs['id_token'], google_requests.Request())
        except Exception as e:
            raise serializers.ValidationError('Invalid Google token')
        email = idinfo.get('email')
        name = idinfo.get('name', '')
        # Мы должны указать username, так как он уникален в AbstractUser
        # И добавить пустые значения для обязательных полей нашей модели
        user, created = User.objects.get_or_create(
            email=email, 
            defaults={
                'name': name,
                'username': email,
                'second_name': '',
                'phone': ''
            }
        )
        attrs['user'] = user
        return attrs

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email']

class TabSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tab
        fields = ['id', 'url', 'title', 'favicon', 'domain', 'browser_tab_id', 'browser_window_id', 'created_at', 'last_accessed']

class TabClassificationSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    url = serializers.URLField()
    title = serializers.CharField(required=False, allow_blank=True)
    favIconUrl = serializers.URLField(required=False, allow_blank=True, allow_null=True)

class TabGroupRequestSerializer(serializers.Serializer):
    tabs = TabClassificationSerializer(many=True)
    categories = serializers.ListField(child=serializers.CharField())
    category = serializers.CharField(required=False)

class TabSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = TabSummary
        fields = ['summary', 'key_points', 'reading_time', 'created_at']

class TabGroupSerializer(serializers.ModelSerializer):
    tabs = TabSerializer(many=True, read_only=True)
    
    class Meta:
        model = TabGroup
        fields = ['id', 'name', 'description', 'ai_generated', 'tabs', 'created_at']

# Serializers for incoming validaton
class TabSyncItemSerializer(serializers.Serializer):
    url = serializers.URLField(max_length=2048)
    title = serializers.CharField(max_length=512, allow_blank=True, required=False)
    favicon = serializers.URLField(max_length=2048, allow_blank=True, required=False, allow_null=True)
    tab_id = serializers.CharField(max_length=64, allow_blank=True, required=False, allow_null=True)
    window_id = serializers.CharField(max_length=64, allow_blank=True, required=False, allow_null=True)
    last_accessed = serializers.FloatField(required=False, allow_null=True)

class TabSyncRequestSerializer(serializers.Serializer):
    tabs = TabSyncItemSerializer(many=True)