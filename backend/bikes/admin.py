from django.contrib import admin
from .models import Bike, UserProfile, UserInventory

@admin.register(Bike)
class BikeAdmin(admin.ModelAdmin):
    list_display=('brand','model_name','rarity','cc')
    list_filter=('brand','rarity')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'tokens_count', 'unlocked_count', 'rank')

admin.site.register(UserInventory)


# Register your models here.
