from django.contrib import admin
from .models import FirewallRule


@admin.register(FirewallRule)
class FirewallRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'src', 'dst', 'proto', 'port', 'action', 'is_active', 'created_by', 'created_at')
    list_filter = ('action', 'proto', 'is_active', 'created_at')
    search_fields = ('name', 'src', 'dst')
    readonly_fields = ('created_at', 'updated_at')



