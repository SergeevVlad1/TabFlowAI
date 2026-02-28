from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    name = models.CharField(max_length=32)
    second_name = models.CharField(max_length=32)
    email = models.EmailField(max_length=32, unique=True)
    phone = models.CharField(max_length=32)
    is_agree = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
