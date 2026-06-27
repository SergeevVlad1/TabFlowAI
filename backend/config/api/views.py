from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.authtoken.models import Token
from .models import User, Task
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
from rest_framework import serializers
genai.configure(api_key=settings.GOOGLE_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash-latest")
def extract_json(text):
    match = re.search(r'\[.*\]', text, re.DOTALL)
    if match:
        return match.group(0)
    raise ValueError("No JSON found")
@api_view(['POST'])
def classify_tabs_view(request):
    class CustomTabClassificationSerializer(serializers.Serializer):
        id = serializers.IntegerField(required=False)
        url = serializers.CharField(max_length=2048)
        title = serializers.CharField(required=False, allow_blank=True)
        favIconUrl = serializers.CharField(max_length=2048, required=False, allow_blank=True, allow_null=True)

    class CustomTabGroupRequestSerializer(serializers.Serializer):
        tabs = CustomTabClassificationSerializer(many=True)
        categories = serializers.ListField(child=serializers.CharField())
        category = serializers.CharField(required=False)

    serializer = CustomTabGroupRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    tabs = serializer.validated_data["tabs"]
    category = serializer.validated_data.get("category")
    categories = serializer.validated_data['categories']
   
    # If category is provided, we use it. If not, we might still use categories list for backward compatibility
    target_category = category if category else (serializer.validated_data["categories"][0] if serializer.validated_data["categories"] else "general")
    prompt = f"""
    You are an expert browser tab organizer. Your job is to classify tabs and intelligently group related ones into meaningful, workflow-based subgroups.
    
    IMPORTANT URL RULES:
    - Accept ALL URLs as-is regardless of scheme (http://, https://, chrome://, file://, localhost, etc.)
    - Never output validation errors about URLs
    - Always classify based on the title and URL content, not URL validity
    
    The user selected focus category: '{target_category}'
    
    YOUR TASK:
    1. Determine if each tab is related to '{target_category}' based on its title and URL.
    2. If a tab is NOT related to '{target_category}' — assign it to "unnecessary".
    3. If a tab IS related to '{target_category}' — assign it to a SPECIFIC SUBGROUP that describes the PURPOSE of the tab.
    
    SUBGROUP NAMING RULES (very important!):
    - DO NOT just use website names, domains, or direct tab titles (e.g., avoid "GitHub", "Render", "Google", "Supabase").
    - INVENT broad, meaningful, conceptual category names that describe the *type of work* or *context* of these tabs.
    - Group tabs that serve a similar workflow purpose together.
    - Examples of good subgroup names: "Code & Version Control", "Cloud Infrastructure", "Database Management", "Research & Docs", "Project Planning", "Local Environment", "Analytics".
    - Keep subgroup names concise (1-3 words) but highly descriptive of the task/concept.
    - If a tab clearly belongs to a broad topic with no specific sub-concept, use '{target_category}' as the subgroup.
    - Generic/empty tabs (e.g. "New Tab", "chrome://newtab/") → "unnecessary"
    
    Return ONLY a valid JSON array. No explanations, no extra text:
    [
      {{"id": 1, "category": "Code Repositories"}},
      {{"id": 2, "category": "Cloud Infrastructure"}},
      {{"id": 3, "category": "unnecessary"}}
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
        
        # Обертка для фронтенда: если пришел массив, превращаем в объект с 'ok' и 'data'
        final_data = parsed
        if isinstance(parsed, list):
            final_data = {
                "ok": True,
                "data": parsed
            }
        
        return Response(final_data, status=status.HTTP_200_OK)
    except Exception as e:
        error_str = str(e).lower()
        print("GEMINI ERROR:", str(e)) # Логируем ошибку в консоль сервера (Render)
        
        # Catch Google Gemini rate limits (429, resource exhausted, quota)
        if "429" in error_str or "exhausted" in error_str or "quota" in error_str:
            return Response(
                {
                    "ok": False, 
                    "error": "Wow! We are getting huge traffic from Product Hunt! 🚀 Please try again in 30-60 seconds."
                },
                status=429
            )
            
        # Catch all other errors
        return Response(
            {
                "ok": False, 
                "error": "AI is taking a quick break to process the massive Product Hunt traffic! Please try again in a moment.",
                "debug_info": str(e) # Временно добавим настоящую ошибку сюда для отладки
            },
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
    errors = serializer.errors
    first_detail = None
    if isinstance(errors, dict):
        for k, v in errors.items():
            if isinstance(v, (list, tuple)) and v:
                first_detail = f"{k}: {v[0]}"
                break
            first_detail = f"{k}: {v}"
            break
    else:
        first_detail = str(errors)
    return Response({
        "ok": False,
        "message": "Validation error",
        "error": {
            "code": 422,
            "details": first_detail or "",
            "errors": errors
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
    errors = serializer.errors
    first_detail = None
    if serializer.is_valid() and not serializer.validated_data:
        first_detail = "email or password is incorrect"
    elif isinstance(errors, dict):
        for k, v in errors.items():
            if isinstance(v, (list, tuple)) and v:
                first_detail = f"{k}: {v[0]}"
                break
            first_detail = f"{k}: {v}"
            break
    else:
        first_detail = str(errors)
    return Response({
        "ok": False,
        "message": "Validation error",
        "error": {
            "code": 401,
            "details": first_detail or "",
            "errors": errors
        }
    }, status=401)
@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth_view(request):
    serializer = GoogleAuthSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        # Используем DRF Token вместо JWT для консистентности со всем проектом
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "ok": True,
            "message": "success",
            "user_token": token.key, # Поле user_token автоматически сохранится во фронтенде
            "data": {
                "user": UserSerializer(user).data,
                "token": token.key,
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


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Simple health check endpoint for keep-alive pings."""
    return Response({"status": "ok", "message": "Server is healthy"})