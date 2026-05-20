from django.utils import timezone
from .models import UserProfile

def check_daily_reward(user):
    profile,created = UserProfile.objects.get_or_create(user=user)
    today=timezone.now().date()

    if profile.last_login_at < today:
        profile.packs_available +=1
        profile.last_login_at=today
        profile.save()
        return True
    return False
    
