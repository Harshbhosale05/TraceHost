from django.urls import path
from .views import check_domain

urlpatterns = [
    path('check/', check_domain),
]
