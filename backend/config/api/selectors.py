from typing import Optional
from django.db.models import Q
from .models import Tab, TabGroup, TabSummary

def get_user_tabs(user):
    """Return all tabs for a user, ordered by most recently accessed."""
    return Tab.objects.filter(user=user).order_by('-last_accessed')

def get_user_tab_groups(user):
    """Return all tab groups for a user, prefetching tabs to avoid N+1 queries."""
    return TabGroup.objects.filter(user=user).prefetch_related('tabs')

def search_user_tabs(user, query: str):
    """
    Search tabs by title, url, or domain.
    For semantic search, you can compute the embedding for the query and do a vector similarity search here.
    """
    if not query:
        return Tab.objects.none()
        
    return Tab.objects.filter(
        Q(user=user) & (Q(title__icontains=query) | Q(url__icontains=query) | Q(domain__icontains=query))
    ).order_by('-last_accessed')

def get_tab_summary(user, tab_id: int) -> Optional[TabSummary]:
    """Return the summary for a specific tab, verifying user ownership."""
    try:
        # We query through the Tab to ensure the user actually owns this tab
        tab = Tab.objects.get(id=tab_id, user=user)
        # Using the reverse relation `summary` from TabSummary OneToOneField
        return hasattr(tab, 'summary') and tab.summary or None
    except Tab.DoesNotExist:
        return None
