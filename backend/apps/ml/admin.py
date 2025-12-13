from django.contrib import admin
from .models import MLModel, Report


@admin.register(MLModel)
class MLModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'version', 'is_active', 'uploaded_at')
    list_filter = ('is_active', 'uploaded_at')
    search_fields = ('name', 'version')
    readonly_fields = ('uploaded_at',)


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('report_type', 'period_start', 'period_end', 'created_at')
    list_filter = ('report_type', 'created_at')
    readonly_fields = ('created_at',)



