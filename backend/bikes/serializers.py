from rest_framework import serializers
from .models import Bike, UserInventory

class BikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bike
        fields = '__all__'

class UserInventorySerializer(serializers.ModelSerializer):
    bike=BikeSerializer(read_only=True)
    class Meta:
        model=UserInventory
        fields=['id', 'bike', 'obtained_at']