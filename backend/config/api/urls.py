from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from .views import (
    # signup, login, 
    sync_tabs_view, groups_view, search_tabs_view, tab_summary_view,
    task_list_create_view, task_detail_view
)

urlpatterns = [
    # path('login', login),
    # path('signup', signup),
    path('tabs/sync', sync_tabs_view),
    path('tabs/groups', groups_view),
    path('tabs/search', search_tabs_view),
    path('tabs/<int:tab_id>/summary', tab_summary_view),
    path('tasks', task_list_create_view),
    path('tasks/<int:pk>', task_detail_view),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)