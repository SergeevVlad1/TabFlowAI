from typing import List, Dict, Any
from django.db import transaction
from django.utils import timezone
from .models import Tab, TabSession
from .tasks import process_tabs_ai
from urllib.parse import urlparse

def sync_user_tabs(user, tabs_data: List[Dict[str, Any]]) -> TabSession:
    """
    1. Create/update tabs
    2. Create TabSession
    3. Link tabs to session
    4. Trigger AI process
    """
    with transaction.atomic():
        session = TabSession.objects.create(user=user)
        
        tab_instances = []
        for tab_item in tabs_data:
            url = tab_item.get('url')
            if not url:
                continue

            last_accessed_ts = tab_item.get('last_accessed')
            last_accessed = timezone.now()
            if last_accessed_ts:
                try:
                    # Convert JS timestamp (ms) to seconds
                    if isinstance(last_accessed_ts, (int, float)) and last_accessed_ts > 1e11:
                        last_accessed_ts = last_accessed_ts / 1000.0
                    last_accessed = timezone.datetime.fromtimestamp(float(last_accessed_ts), tz=timezone.utc)
                except (ValueError, TypeError):
                    pass

            # Extract domain safely
            domain = ""
            try:
                parsed = urlparse(url)
                domain = parsed.netloc
            except Exception:
                pass

            tab, created = Tab.objects.update_or_create(
                user=user,
                url=url,
                defaults={
                    'title': tab_item.get('title', '')[:512],
                    'favicon': tab_item.get('favicon', '')[:2048] if tab_item.get('favicon') else None,
                    'domain': domain[:255],
                    'browser_tab_id': str(tab_item.get('tab_id', ''))[:64],
                    'browser_window_id': str(tab_item.get('window_id', ''))[:64],
                    'last_accessed': last_accessed,
                }
            )

            tab_instances.append(tab)
        
        if tab_instances:
            session.tabs.set(tab_instances)
    
    # Trigger Celery task
    process_tabs_ai.delay(session.id)
    
    return session
