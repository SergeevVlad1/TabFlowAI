from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Разрешаем CORS для расширения
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Tab(BaseModel):
    id: int
    title: str
    url: str

class TabList(BaseModel):
    tabs: List[Tab]

@app.post("/classify-tabs")
async def classify_tabs(data: TabList):
    """
    Классифицирует вкладки по группам с помощью ИИ.
    В реальном приложении здесь будет вызов OpenAI/Claude API.
    """
    if not data.tabs:
        return {"groups": {}}

    # Логика классификации (заглушка ИИ)
    # В реальности тут будет промпт к LLM
    groups = {
        "Работа": [],
        "Развлечения": [],
        "Учеба": [],
        "Другое": []
    }

    for tab in data.tabs:
        title = tab.title.lower()
        url = tab.url.lower()
        
        if any(word in title or word in url for word in ["github", "jira", "docs", "stack", "localhost"]):
            groups["Работа"].append(tab.id)
        elif any(word in title or word in url for word in ["youtube", "netflix", "facebook", "vk", "instagram"]):
            groups["Развлечения"].append(tab.id)
        elif any(word in title or word in url for word in ["wiki", "course", "edu", "learn"]):
            groups["Учеба"].append(tab.id)
        else:
            groups["Другое"].append(tab.id)

    # Убираем пустые группы
    return {"groups": {k: v for k, v in groups.items() if v}}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
