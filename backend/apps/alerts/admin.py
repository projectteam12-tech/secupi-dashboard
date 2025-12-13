from django.contrib import admin
from .models import Alert


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('alert_type', 'severity', 'src_ip', 'dst_ip', 'status', 'timestamp', 'created_at')
    list_filter = ('alert_type', 'severity', 'status', 'timestamp')
    search_fields = ('message', 'src_ip', 'dst_ip')
    readonly_fields = ('created_at', 'resolved_at')
    date_hierarchy = 'timestamp'
    actions = ['mark_as_resolved', 'mark_as_ignored']
    
    def mark_as_resolved(self, request, queryset):
        queryset.update(status='resolved')
    mark_as_resolved.short_description = 'Mark selected alerts as resolved'
    
    def mark_as_ignored(self, request, queryset):
        queryset.update(status='ignored')
    mark_as_ignored.short_description = 'Mark selected alerts as ignored'



