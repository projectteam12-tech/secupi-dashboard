"""
URL configuration for secupi project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.dashboard import views as dashboard_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/logs/', include('apps.logs.urls')),
    path('api/alerts/', include('apps.alerts.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
    path('api/firewall/', include('apps.firewall.urls')),
    path('api/ml/', include('apps.ml.urls')),
    path('api/settings/', include('apps.settings.urls')),
    path('api/health/', dashboard_views.health, name='health'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

