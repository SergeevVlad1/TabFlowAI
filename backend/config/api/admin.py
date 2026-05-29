from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from api.models import User, Tab, TabSession, TabGroup, TabEmbedding, TabSummary, Task

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "name", "second_name", "phone", "is_staff", "created_at")
    search_fields = ("email", "username", "name", "second_name")
    ordering = ("-created_at",)
    
    # Custom fields addition to admin form
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Additional Info", {"fields": ("name", "second_name", "phone", "is_agree")}),
    )

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "priority", "completed", "completed_at", "estimatedTime", "timeSpent", "created_at")
    list_filter = ("completed", "priority", "created_at")
    search_fields = ("title", "user__email", "user__username")
    ordering = ("-created_at",)

@admin.register(Tab)
class TabAdmin(admin.ModelAdmin):
    list_display = ("title", "url", "user", "domain", "last_accessed", "created_at")
    list_filter = ("domain", "created_at")
    search_fields = ("title", "url", "domain", "user__email")
    ordering = ("-last_accessed",)

@admin.register(TabSession)
class TabSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__email",)
    ordering = ("-created_at",)

@admin.register(TabGroup)
class TabGroupAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "ai_generated", "created_at", "updated_at")
    list_filter = ("ai_generated", "created_at")
    search_fields = ("name", "user__email")
    ordering = ("-created_at",)

@admin.register(TabSummary)
class TabSummaryAdmin(admin.ModelAdmin):
    list_display = ("tab", "reading_time", "created_at")
    list_filter = ("created_at",)
    search_fields = ("tab__title", "summary")

@admin.register(TabEmbedding)
class TabEmbeddingAdmin(admin.ModelAdmin):
    list_display = ("tab", "created_at")
    search_fields = ("tab__title",)
