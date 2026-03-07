from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.authtoken.models import Token
from .models import User
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    RegisterSerializer, LoginSerializer, GoogleAuthSerializer, UserSerializer,
    TabSerializer, TabGroupSerializer, TabSummarySerializer, 
    TabSyncRequestSerializer, TaskSerializer, TabGroupRequestSerializer
)
from .services import sync_user_tabs
from .selectors import get_user_tab_groups, search_user_tabs, get_tab_summary
from django.conf import settings
import json
import google.generativeai as genai
import re

genai.configure(api_key=settings.GOOGLE_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

def extract_json(text):
    match = re.search(r'\[.*\]', text, re.DOTALL)
    if match:
        return match.group(0)
    raise ValueError("No JSON found")

@api_view(['POST'])
def classify_tabs_view(request):    
    serializer = TabGroupRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    tabs = serializer.validated_data["tabs"]
    categories = serializer.validated_data["categories"]

    prompt = f"""
    You are a strict JSON classifier.

    Categorize each browser tab into ONE of these categories:
    {categories}

    Return ONLY valid JSON array like this:
    [
      {{"id": 1, "category": "study"}}
    ]

    Tabs:
    {tabs}
    """ 

    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "response_mime_type": "application/json"
            }
        )

        raw_text = response.text

        json_string = extract_json(raw_text)
        parsed = json.loads(json_string)

        return Response(parsed, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
def signup(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "ok": True,
            "message": "success",
            "user_token": token.key,
            "user": serializer.data
        }, status=201)
    return Response({
        "ok": False,
        "message": "error",
        "error": {
            "code": 422,
            "details": "Validation error",
            "errors": serializer.errors
        }
    }, status=422)


@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid() and serializer.validated_data:
        user = serializer.validated_data
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "ok": True,
            "message": "success",
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
        })
    return Response({
        "ok": False,
        "message": "error",
        "error": {
            "code": 401,
            "details": "Authentication failed"
        }
    }, status=401)

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth_view(request):
    serializer = GoogleAuthSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            "ok": True,
            "message": "success",
            "data": {
                "user": UserSerializer(user).data,
                "token": str(refresh.access_token),
                "refresh": str(refresh)
            }
        })
    return Response({"ok": False, "message": "error", "error": serializer.errors}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    serializer = UserSerializer(request.user)
    return Response({
        "ok": True,
        "message": "success",
        "data": serializer.data
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def task_list_create_view(request):
    if request.method == 'GET':
        tasks = Task.objects.filter(user=request.user)
        serializer = TaskSerializer(tasks, many=True)
        return Response({"message": "success", "data": serializer.data})
    
    elif request.method == 'POST':
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"message": "success", "data": serializer.data}, status=201)
        return Response({"message": "error", "error": serializer.errors}, status=400)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def task_detail_view(request, pk):
    task = get_object_or_404(Task, pk=pk, user=request.user)
    
    if request.method == 'GET':
        serializer = TaskSerializer(task)
        return Response({"message": "success", "data": serializer.data})
    
    elif request.method in ['PUT', 'PATCH']:
        serializer = TaskSerializer(task, data=request.data, partial=(request.method == 'PATCH'))
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "success", "data": serializer.data})
        return Response({"message": "error", "error": serializer.errors}, status=400)
    
    elif request.method == 'DELETE':
        task.delete()
        return Response({"message": "success", "data": None}, status=204)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_tabs_view(request):
    """Endpoint for the browser extension to sync open tabs."""
    serializer = TabSyncRequestSerializer(data=request.data)
    if serializer.is_valid():
        tabs_data = serializer.validated_data.get('tabs', [])
        session = sync_user_tabs(request.user, tabs_data)
        return Response({
            "message": "success",
            "data": {"session_id": session.id, "tabs_synced": len(tabs_data)}
        }, status=201)
    return Response({"message": "error", "error": serializer.errors}, status=400)

from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def groups_view(request):
    """Returns AI-generated and custom tab groups for the user."""
    groups = get_user_tab_groups(request.user)
    
    paginator = StandardResultsSetPagination()
    result_page = paginator.paginate_queryset(groups, request)
    serializer = TabGroupSerializer(result_page, many=True)
    
    return Response({
        "message": "success", 
        "data": serializer.data,
        "meta": {
            "count": paginator.page.paginator.count,
            "next": paginator.get_next_link(),
            "previous": paginator.get_previous_link()
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_tabs_view(request):
    """Search tabs by semantics, url, or title."""
    query = request.query_params.get('q', '')
    tabs = search_user_tabs(request.user, query)
    
    paginator = StandardResultsSetPagination()
    result_page = paginator.paginate_queryset(tabs, request)
    serializer = TabSerializer(result_page, many=True)
    
    return Response({
        "message": "success", 
        "data": serializer.data,
        "meta": {
            "count": paginator.page.paginator.count,
            "next": paginator.get_next_link(),
            "previous": paginator.get_previous_link()
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tab_summary_view(request, tab_id):
    """Get the AI summary and key points for a specific tab."""
    summary = get_tab_summary(request.user, tab_id)
    if not summary:
        return Response({"message": "error", "error": "Summary not found"}, status=404)
    serializer = TabSummarySerializer(summary)
    return Response({"message": "success", "data": serializer.data})