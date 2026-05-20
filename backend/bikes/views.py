import random 
from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

# Django REST Framework Components
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.authtoken.models import Token

# Local Schema Imports
from .models import Bike, UserProfile, UserInventory
from .serializers import BikeSerializer, UserInventorySerializer


# ── 1. SIGNUP VIEWS ──
@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username or not password or not email:
        return Response({'error': 'Please provide username, email, and password.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username is already taken.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.create_user(username=username, email=email, password=password)
        Token.objects.create(user=user)
        
        # ⚡️ Updated to use your exact model field name: tokens_count
        UserProfile.objects.get_or_create(user=user, defaults={'tokens_count': 5})
        
        return Response({'message': 'User registered successfully!'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ── 2. LOGIN VIEWS ──
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Please provide both username and password.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    if user is not None:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'username': user.username
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)


# ── 3. LIVE USER METRICS PROFILE VIEW ──
@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def profile_view(request):
    user = request.user
    
    # ⚡️ Fixed field names to sync explicitly with your exact UserProfile model
    profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'tokens_count': 5})
    unlocked_garage_count = UserInventory.objects.filter(user=user).count()
    
    return Response({
        'username': user.username,
        'email': user.email,
        'tokens_count': profile.tokens_count,    # 🪙 Matches model
        'unlocked_count': unlocked_garage_count, # 🏍️ Matches inventory rows
        'rank': profile.rank                     # Matches model default
    }, status=status.HTTP_200_OK)


# ── 4. FIXED SHOWROOM DIRECTORY FILTER ENDPOINT ──
@api_view(['GET'])
@permission_classes([AllowAny])
def marketplace_view(request):
    brand = request.query_params.get('brand', '').strip()
    rarity_str = request.query_params.get('rarity', '').strip().lower()
    min_bhp = request.query_params.get('min_bhp', '').strip()
    
    queryset = Bike.objects.all()
    
    if brand:
        queryset = queryset.filter(brand__iexact=brand)
        
    # ⚡️ TRANSLATION LAYER: Maps incoming text parameters to your model's choice integers!
    if rarity_str:
        rarity_map = {
            'common': 1,
            'rare': 2,
            'epic': 3,
            'legendary': 4
        }
        target_integer = rarity_map.get(rarity_str)
        if target_integer:
            queryset = queryset.filter(rarity=target_integer)
        
    if min_bhp:
        try:
            # Matches your exact model column field name: 'power'
            queryset = queryset.filter(power__gte=float(min_bhp))
        except ValueError:
            pass 
        
    serializer = BikeSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ── 5. FIXED TOKEN-BURNING PACK ROTATOR ENGINE ──
class OpenPackViews(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user, defaults={'tokens_count': 5})
        
        if profile.tokens_count <= 0:
            return Response({"error": "No pack access tokens remaining inside your registry bank account."}, status=status.HTTP_400_BAD_REQUEST)
        
        all_bikes = list(Bike.objects.all())
        if not all_bikes:
            return Response({"error": "No vehicle objects initialized inside systemic core databases."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # 🎲 Probability calculation weights mapped directly to your IntegerChoices indices
        # Index 1 (Common) = high weight, Index 4 (Legendary) = slim weight
        rarity_weights = {
            1: 70,  # Common
            2: 20,  # Rare
            3: 8,   # Epic
            4: 2    # Legendary
        }
        
        weights = [rarity_weights.get(b.rarity, 50) for b in all_bikes]
        selected_bike = random.choices(all_bikes, weights=weights, k=1)[0]
        
        # Save tracking data in user's inventory
        UserInventory.objects.create(user=request.user, bike=selected_bike)
        
        # Burn exactly 1 token from your model property
        profile.tokens_count -= 1
        profile.save()
        
        serializer = BikeSerializer(selected_bike)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ── 6. PERSONAL USER GARAGE ARCHIVE LEDGER ──
class MyInventoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_bikes = UserInventory.objects.filter(user=request.user).order_by('-obtained_at')
        serializer = UserInventorySerializer(user_bikes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)