from rest_framework import serializers
from django.contrib.auth import authenticate


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(max_length=32, min_length=6, write_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'second_name', 'email', 'phone', 'is_agree', 'password', 'is_staff']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data, username=validated_data['email'])


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        user = authenticate(**attrs)
        return user if user else False