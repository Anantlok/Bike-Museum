from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Bike(models.Model):
    Rarity_choices=[
        (1, 'Common'),
        (2, 'Rare'),
        (3, 'Epic'),
        (4, 'Legendary'),
    ]
    brand =models.CharField(max_length=100)
    model_name=models.CharField(max_length=100)
    bike_type=models.CharField(max_length=100) #cruiser, cafe rider etc
    cc= models.IntegerField()
    power=models.FloatField()
    rarity=models.IntegerField(choices=Rarity_choices, default=1)
    image_url=models.URLField(null=True, blank=True)

    def __str__(self):
        return f"{self.brand} {self.model_name}"

class UserProfile(models.Model):
    user=models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    tokens_count = models.IntegerField(default=5)
    unlocked_count = models.IntegerField(default=0)
    rank = models.IntegerField(default=100)
    def __str__(self):
        return f"{self.user.username}'s Garage Profile"
class UserInventory(models.Model):
    user=models.ForeignKey(User, on_delete=models.CASCADE)
    bike=models.ForeignKey(Bike, on_delete=models.CASCADE)
    obtained_at=models.DateTimeField(auto_now_add=True)