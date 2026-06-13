from django.contrib import admin

# Register your models here.
from .models import Assessment


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'risk_level',
        'risk_score',
        'total_severity',
        'created_at',
    )

    list_filter = (
        'risk_level',
        'created_at',
    )

    search_fields = (
        'user__username',
        'risk_level',
    )

    readonly_fields = (
        'created_at',
    )

    ordering = ('-created_at',)
