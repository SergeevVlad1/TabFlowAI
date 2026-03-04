import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import User
from rest_framework_simplejwt.tokens import RefreshToken

def generate_token_for_first_user():
    user = User.objects.first()
    if not user:
        # Создаем тестового пользователя, если база пуста
        user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='password123',
            name='Test'
        )
        print("Created test user: test@example.com / password123")
    
    refresh = RefreshToken.for_user(user)
    print("\n--- JWT TOKEN FOR USER: " + user.email + " ---")
    print("Access Token:")
    print(str(refresh.access_token))
    print("\nRefresh Token:")
    print(str(refresh))
    print("-------------------------------------------\n")

if __name__ == "__main__":
    generate_token_for_first_user()
