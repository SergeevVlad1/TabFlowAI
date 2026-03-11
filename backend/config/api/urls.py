from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from .views import (
    sync_tabs_view, groups_view, search_tabs_view, tab_summary_view,
    task_list_create_view, task_detail_view,
    signup, login, google_auth_view, me_view, classify_tabs_view
)

urlpatterns = [
    path('auth/register', signup),
    path('auth/login', login),
    path('auth/google', google_auth_view),
    path('auth/me', me_view),
    path('tabs/sync', sync_tabs_view),
    path('tabs/groups', classify_tabs_view),
    path('tabs/search', search_tabs_view),
    path('tabs/<int:tab_id>/summary', tab_summary_view),
    path('tasks', task_list_create_view),
    path('task/<int:pk>', task_detail_view),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)