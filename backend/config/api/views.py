from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.authtoken.models import Token
from .models import User
from .serializers import SignupSerializer, LoginSerializer, UserSerializer
from django.shortcuts import get_object_or_404



@api_view(['POST'])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "message": "success",
            "error": None,
            "data": {
                "user_token": token.key,
                "user": serializer.data
            }
        }, status=201)
    return Response({
        "message": "error",
        "error": {
            "code": 422,
            "details": "Validation error",
            "errors": serializer.errors
        },
        "data": None
    }, status=422)


@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid() and serializer.validated_data:
        user = serializer.validated_data
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "message": "success",
            "error": None,
            "data": {
                "user_token": token.key,
                "user": {
                    'id': user.id,
                    'name': user.name,
                    'second_name': user.second_name,
                    'email': user.email,
                    'phone': user.phone,
                    'is_agree': user.is_agree,
                    'is_staff': user.is_staff,
                }
            }
        }, status=201)
    return Response({
        "message": "error",
        "error": {
            "code": 401,
            "details": "Authentication failed"
        },
        "data": None
    }, status=401)