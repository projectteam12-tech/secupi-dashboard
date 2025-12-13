from django.db import models
import os


def model_file_path(instance, filename):
    """Generate file path for uploaded ML models."""
    return f'ml_models/{instance.name}_{instance.version}/{filename}'


class MLModel(models.Model):
    """
    Model to store ML model metadata and file references.
    """
    name = models.CharField(max_length=255)
    version = models.CharField(max_length=50)
    metrics = models.JSONField(null=True, blank=True, help_text='Model performance metrics')
    file_ref = models.FileField(upload_to=model_file_path, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)
    description = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'ml_models'
        ordering = ['-uploaded_at']
        unique_together = [['name', 'version']]
    
    def __str__(self):
        return f"{self.name} v{self.version}"


class Report(models.Model):
    """
    Model to store generated reports.
    """
    REPORT_TYPE_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('custom', 'Custom'),
    ]
    
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    file_ref = models.FileField(upload_to='reports/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'reports'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.report_type} Report ({self.period_start} - {self.period_end})"



