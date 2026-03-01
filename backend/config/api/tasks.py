import time
from celery import shared_task
from .models import TabSession, TabEmbedding, TabSummary, TabGroup

@shared_task
def process_tabs_ai(session_id: int):
    """
    Background task to process a session of tabs.
    1. Extract domain
    2. Classify tab
    3. Create embedding
    4. Create summary
    5. Propose group
    """
    try:
        session = TabSession.objects.prefetch_related('tabs', 'user').get(id=session_id)
    except TabSession.DoesNotExist:
        return "Session not found"

    user = session.user
    for tab in session.tabs.all():
        # Avoid reprocessing if already summarized recently
        if hasattr(tab, 'summary'):
            continue

        # TODO: Integrate with real AI APIs (e.g. OpenAI, HuggingFace embeddings)
        
        # 1. Mock Embedding Generation
        TabEmbedding.objects.update_or_create(
            tab=tab,
            defaults={'vector': [0.1, 0.2, 0.3]} 
        )

        # 2. Mock Summary Generation
        TabSummary.objects.update_or_create(
            tab=tab,
            defaults={
                'summary': f"AI-generated summary for {tab.title or tab.url}",
                'key_points': ["Key point 1", "Key point 2"],
                'reading_time': 2
            }
        )
        
        # 3. Mock Grouping Logic based on domains
        group_name = "General"
        if tab.domain:
            if "github.com" in tab.domain or "stackoverflow.com" in tab.domain:
                group_name = "Development"
            elif "youtube.com" in tab.domain or "netflix.com" in tab.domain:
                group_name = "Entertainment"
            elif "google" in tab.domain:
                group_name = "Research"
                
        group, _ = TabGroup.objects.get_or_create(
            user=user, 
            name=group_name,
            defaults={'ai_generated': True, 'description': f"Categorized group for {group_name}"}
        )
        group.tabs.add(tab)

    return f"Processed session {session_id}"
