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
        user, created = User.objects.get_or_create(
            username=username,
            defaults={'email': email, 'is_superuser': True, 'is_staff': True}
        )
        user.set_password(password)
        user.is_superuser = True
        user.is_staff = True
        user.email = email
        user.save()
        if created:
            print("Superuser created successfully!")
        else:
            print("Superuser credentials updated/set successfully!")
    except Exception as e:
        print(f"Error creating/updating superuser: {e}")

if __name__ == '__main__':
    create_admin()
