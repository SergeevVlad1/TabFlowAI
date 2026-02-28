from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated, PermissionDenied
from rest_framework.views import exception_handler
from django.http import Http404


def my_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if isinstance(exc, PermissionDenied or AuthenticationFailed):
        response.status_code = 403
        response.data = {
            "message": "error",
            "error": {
                "code": 403,
                "details": "Access denied"
            },
            "data": None
        }
    elif isinstance(exc, NotAuthenticated):
        response.status_code = 401
        response.data = {
            "message": "error",
            "error": {
                "code": 401,
                "details": "The provided token is invalid or expired."
            },
            "data": None
        }
    elif isinstance(exc, Http404):
        response.status_code = 404
        response.data = {
            "message": "error",
            "error": {
                "code": 404,
                "details": "Not found"
            },
            "data": None
        }
    return response