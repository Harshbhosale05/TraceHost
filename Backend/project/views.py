from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)

def custom_404(request, exception):
    """
    Custom 404 handler that returns JSON
    """
    logger.warning(f"404 Error: {request.path} not found. Exception: {exception}")
    return JsonResponse({
        'error': 'Not Found',
        'message': 'The requested resource was not found',
        'status_code': 404
    }, status=404)

def custom_500(request):
    """
    Custom 500 handler that returns JSON
    """
    logger.error(f"500 Error: Server error when accessing {request.path}")
    return JsonResponse({
        'error': 'Internal Server Error',
        'message': 'An unexpected server error occurred',
        'status_code': 500
    }, status=500) 