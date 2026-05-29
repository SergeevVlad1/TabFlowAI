from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    name = models.CharField(max_length=32)
    second_name = models.CharField(max_length=32)
    email = models.EmailField(max_length=32, unique=True)
    phone = models.CharField(max_length=32)
    created_at = models.DateTimeField(auto_now_add=True)
    is_agree = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]


class Tab(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tabs')
    title = models.CharField(max_length=512, blank=True)
    url = models.URLField(max_length=2048)
    favicon = models.URLField(max_length=2048, blank=True, null=True)
    domain = models.CharField(max_length=255, db_index=True)
    
    # Store origin identifiers to help with tracking and syncing
    browser_tab_id = models.CharField(max_length=64, blank=True, null=True)
    browser_window_id = models.CharField(max_length=64, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_accessed = models.DateTimeField(db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'url']),
        ]

    def __str__(self):
        return f"{self.title or self.url} ({self.user.email})"


class TabSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    tabs = models.ManyToManyField(Tab, related_name='sessions')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session {self.id} for {self.user.email}"


class TabGroup(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tab_groups')
    tabs = models.ManyToManyField(Tab, related_name='groups', blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    ai_generated = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'name']),
        ]

    def __str__(self):
        return self.name


class TabEmbedding(models.Model):
    tab = models.OneToOneField(Tab, on_delete=models.CASCADE, related_name='embedding')
    # Using JSONField to store the embedding vector. 
    # For a high-performance production setup on Postgres, you can migrate this
    # to VectorField from the pgvector/django-pgvector package.
    vector = models.JSONField(help_text="Store a list of floats representing the semantic embedding")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Embedding for Tab {self.tab_id}"


class TabSummary(models.Model):
    tab = models.OneToOneField(Tab, on_delete=models.CASCADE, related_name='summary')
    summary = models.TextField()
    key_points = models.JSONField(default=list, help_text="List of strings of key points extracted by AI")
    reading_time = models.IntegerField(help_text="Estimated reading time in minutes", null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Task(models.Model):
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    time = models.TimeField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Store estimated time in minutes and time spent in milliseconds
    estimatedTime = models.IntegerField(default=25)
    timeSpent = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.completed and not self.completed_at:
            from django.utils import timezone
            self.completed_at = timezone.now()
        elif not self.completed:
            self.completed_at = None
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.user.email})"
