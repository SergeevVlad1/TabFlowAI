from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.authtoken.models import Token
from .models import User
# from .serializers import SignupSerializer, LoginSerializer, UserSerializer
from django.shortcuts import get_object_or_404



# @api_view(['POST'])
# def signup(request):
#     serializer = SignupSerializer(data=request.data)
#     if serializer.is_valid():
#         user = serializer.save()
#         token, _ = Token.objects.get_or_create(user=user)
#         return Response({
#             "message": "success",
#             "error": None,
#             "data": {
#                 "user_token": token.key,
#                 "user": serializer.data
#             }
#         }, status=201)
#     return Response({
#         "message": "error",
#         "error": {
#             "code": 422,
#             "details": "Validation error",
#             "errors": serializer.errors
#         },
#         "data": None
#     }, status=422)


# @api_view(['POST'])
# def login(request):
#     serializer = LoginSerializer(data=request.data)
#     if serializer.is_valid() and serializer.validated_data:
#         user = serializer.validated_data
#         token, _ = Token.objects.get_or_create(user=user)
#         return Response({
#             "message": "success",
#             "error": None,
#             "data": {
#                 "user_token": token.key,
#                 "user": {
#                     'id': user.id,
#                     'name': user.name,
#                     'second_name': user.second_name,
#                     'email': user.email,
#                     'phone': user.phone,
#                     'is_agree': user.is_agree,
#                     'is_staff': user.is_staff,
#                 }
#             }
#         }, status=201)
#     return Response({
#         "message": "error",
#         "error": {
#             "code": 401,
#             "details": "Authentication failed"
#         },
#         "data": None
#     }, status=401)


from rest_framework.permissions import IsAuthenticated
from .serializers import (
    TabSerializer, TabGroupSerializer, TabSummarySerializer, 
    TabSyncRequestSerializer
)
from .services import sync_user_tabs
from .selectors import get_user_tab_groups, search_user_tabs, get_tab_summary

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