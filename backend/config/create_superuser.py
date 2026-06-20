import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import User

def create_admin():
    email = os.getenv('ADMIN_EMAIL', 'admin@example.com')
    username = os.getenv('ADMIN_USERNAME', 'admin')
    password = os.getenv('ADMIN_PASSWORD', 'adminpass123')
    
    try:
        if not User.objects.filter(is_superuser=True).exists():
            User.objects.create_superuser(username=username, email=email, password=password)
            print("Superuser created successfully!")
        else:
            print("Superuser already exists.")
    except Exception as e:
        print(f"Error creating superuser: {e}")

if __name__ == '__main__':
    create_admin()
