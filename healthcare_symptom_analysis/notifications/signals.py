from django.db.models.signals import post_save
from django.dispatch import receiver
from appointments.models import Appointment
from recommendations.models import DoctorSuggestion
from .models import Notification


@receiver(post_save, sender=Appointment)
def appointment_notification(sender, instance, created, **kwargs):
    if created:
        # Notify patient
        Notification.objects.create(
            user        = instance.user,                          # ✅ fixed
            notif_type  = 'appointment_upcoming',
            title       = 'Appointment Booked',
            message     = f'Your appointment with Dr. {instance.doctor.doctor_name} is scheduled for {instance.appointment_date.strftime("%b %d, %Y at %I:%M %p")}.',
            navigate_to = '/appointments',
        )
        # Notify doctor
        if instance.doctor and instance.doctor.user:
            Notification.objects.create(
                user        = instance.doctor.user,               # ✅ fixed
                notif_type  = 'appointment_upcoming',
                title       = 'New Appointment Booked',
                message     = f'{instance.user.get_full_name() or instance.user.username} booked an appointment on {instance.appointment_date.strftime("%b %d, %Y at %I:%M %p")}.',
                navigate_to = '/appointments',
            )
    else:
        status_map = {
            'confirmed': (
                'appointment_confirmed',
                'Appointment Confirmed',
                f'Your appointment with Dr. {instance.doctor.doctor_name} on {instance.appointment_date.strftime("%b %d")} is confirmed.',
            ),
            'cancelled': (
                'appointment_cancelled',
                'Appointment Cancelled',
                f'Your appointment with Dr. {instance.doctor.doctor_name} on {instance.appointment_date.strftime("%b %d")} has been cancelled.',
            ),
            'completed': (
                'appointment_completed',
                'Appointment Completed',
                f'Your appointment with Dr. {instance.doctor.doctor_name} is marked as complete.',
            ),
        }
        if instance.status in status_map:
            ntype, title, msg = status_map[instance.status]
            Notification.objects.create(
                user        = instance.user,                      # ✅ fixed
                notif_type  = ntype,
                title       = title,
                message     = msg,
                navigate_to = '/appointments',
            )


@receiver(post_save, sender=DoctorSuggestion)
def suggestion_notification(sender, instance, created, **kwargs):
    print(f"Signal fired! created={created}, type={instance.suggestion_type}, public={instance.is_public}")

    if not created:
        return

    if instance.suggestion_type != 'recommendation':
        return

    from accounts.models import User

    doctor_name = instance.doctor.doctor_name if instance.doctor else 'A doctor'

    if instance.is_public:
        # Notify ALL patients
        patients = User.objects.filter(role='patient')
        Notification.objects.bulk_create([
            Notification(
                user        = patient,
                notif_type  = 'suggestion_posted',
                title       = 'New Patient Recommendation',
                message     = f'Dr. {doctor_name} posted a recommendation: "{instance.title}".',
                navigate_to = '/dashboard',
                related_object_id  = instance.id,   # store suggestion id

            )
            for patient in patients
        ])

    else:
        # Private — try recommendation FK first, fall back to ALL patients
        if instance.recommendation and instance.recommendation.user:
            # Notify specific patient linked via Recommendation FK
            Notification.objects.create(
                user        = instance.recommendation.user,
                notif_type  = 'suggestion_posted',
                title       = 'New Recommendation For You',
                message     = f'Dr. {doctor_name} posted a recommendation for you: "{instance.title}".',
                navigate_to = '/dashboard',
                related_object_id  = instance.id,   # store suggestion id

            )
        else:
            # No linked patient — notify all patients anyway
            patients = User.objects.filter(role='patient')
            Notification.objects.bulk_create([
                Notification(
                    user        = patient,
                    notif_type  = 'suggestion_posted',
                    title       = 'New Recommendation',
                    message     = f'Dr. {doctor_name} shared a recommendation: "{instance.title}".',
                    navigate_to = '/dashboard',
                    related_object_id  = instance.id,   # store suggestion id

                )
                for patient in patients
            ])