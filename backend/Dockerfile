# Стадия разработки — с hot-reload
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Для разработки — runserver с 0.0.0.0
EXPOSE 8000

# В production потом заменишь на gunicorn
CMD ["python", "config/manage.py", "runserver", "0.0.0.0:8000"]