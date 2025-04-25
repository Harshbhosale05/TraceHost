from django.urls import path
from . import views
from django.views.decorators.cache import cache_page

urlpatterns = [
    # Main API endpoints that match frontend expectations
    path('analyze', views.analyze_domain, name='check_domain'),  # Frontend expects /api/analyze
    path('analyze/', views.analyze_domain, name='check_domain_slash'),  # Adding trailing slash version
    path('health', views.health_check, name='health_check'),  # Add health check endpoint
    path('health/', views.health_check, name='health_check_slash'),  # With trailing slash
    path('suspicious', views.suspicious_view, name='suspicious_view'),  # Frontend expects /api/suspicious
    path('suspicious/', views.suspicious_view, name='suspicious_view_slash'),  # With trailing slash
    path('dashboard', cache_page(60 * 5)(views.get_dashboard_data), name='dashboard-data'),  # Frontend expects /api/dashboard
    path('dashboard/', cache_page(60 * 5)(views.get_dashboard_data), name='dashboard-data-slash'),  # With trailing slash
    path('suspicious_domains', views.suspicious_domains_list, name='suspicious_domains_list'),  # Frontend expects /api/suspicious_domains
    path('suspicious_domains/', views.suspicious_domains_list, name='suspicious_domains_list_slash'),  # With trailing slash
    path('flag_domain', views.flag_domain, name='flag_domain'),  # Add new endpoint for flagging domains
    path('flag_domain/', views.flag_domain, name='flag_domain_slash'),  # With trailing slash
    
    # Additional routes with trailing slashes for flexibility
    path('domain-check/', views.analyze_domain, name='domain_check'),
    path('suspicious/', views.suspicious_view, name='suspicious_view_alt'),
    path('dashboard/', views.get_dashboard_data, name='dashboard_data_alt'),
    path('suspicious-domains/', views.suspicious_domains_list, name='suspicious_domains_list_alt'),
    path('flag-domain/', views.flag_domain, name='flag_domain_alt'),
    
    # Keep the old paths for backward compatibility
    path('check_domain/', views.analyze_domain, name='check_domain_old'),
    path('api/analyze_domain/', views.analyze_domain, name='analyze_domain_old'),
    path('api/check_domain/', views.analyze_domain, name='check_domain_api_old'),
    path('api/get_dashboard_data/', cache_page(60 * 5)(views.get_dashboard_data), name='dashboard-data-old'),
]
