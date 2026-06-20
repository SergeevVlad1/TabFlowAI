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
        # 1. Сначала ищем по email, так как email уникальный
        user = User.objects.filter(email=email).first()
        if user:
            user.set_password(password)
            user.is_superuser = True
            user.is_staff = True
            user.username = username
            user.save()
            print("Superuser credentials updated/set successfully (by email)!")
        else:
            # 2. Если по email не нашли, ищем по username
            user = User.objects.filter(username=username).first()
            if user:
                user.email = email
                user.set_password(password)
                user.is_superuser = True
                user.is_staff = True
                user.save()
                print("Superuser credentials updated/set successfully (by username)!")
            else:
                # 3. Если ничего не нашли, создаем нового
                User.objects.create_superuser(username=username, email=email, password=password)
                print("Superuser created successfully!")
    except Exception as e:
        print(f"Error creating/updating superuser: {e}")

if __name__ == '__main__':
    create_admin()
