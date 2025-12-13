from django.contrib import admin
from .models import NetworkLog


@admin.register(NetworkLog)
class NetworkLogAdmin(admin.ModelAdmin):
    list_display = ('src_ip', 'dst_ip', 'proto', 'action', 'packet_size', 'timestamp', 'created_at')
    list_filter = ('proto', 'action', 'timestamp')
    search_fields = ('src_ip', 'dst_ip')
    readonly_fields = ('created_at',)
    date_hierarchy = 'timestamp'



