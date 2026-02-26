from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router for the UserManagement ViewSet
router = DefaultRouter()
router.register(r'users', views.UserManagementViewSet, basename='user-management')

urlpatterns = [
    # Settings sections
    path('alerts/', views.alert_thresholds, name='alert-thresholds'),
    path('notifications/', views.notification_settings, name='notification-settings'),
    path('firewall/', views.firewall_defaults, name='firewall-defaults'),
    path('security/', views.security_settings, name='security-settings'),

    # User management (ViewSet)
    path('', include(router.urls)),

    # Export & Reports
    path('export/logs/', views.export_logs, name='export-logs'),
    path('export/alerts/', views.export_alerts, name='export-alerts'),
    path('export/report/', views.summary_report, name='summary-report'),
]
