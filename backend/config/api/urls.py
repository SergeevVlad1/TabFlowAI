from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from .views import signup, login

urlpatterns = [
                  path('login', login),
                  path('signup', signup),
              ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)