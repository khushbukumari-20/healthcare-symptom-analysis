from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'notif_type', 'title', 'message','related_object_id', 'is_read', 'navigate_to', 'created_at']
        read_only_fields = ['id', 'created_at']