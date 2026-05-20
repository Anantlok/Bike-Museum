from django.urls import path
from . import views  # 👈 This relative import brings in all function-based views cleanly
from .views import OpenPackViews, MyInventoryView  # 👈 Keep these class-based views

urlpatterns = [
    # ── 1. SHOWROOM SHOWCASE DIRECTORY ──
    # ⚡️ Changed from BikeMarketplace.as_view() to views.marketplace_view
    path('marketplace/', views.marketplace_view, name='bike-market'),
    
    # ── 2. GACHA CRATE MINTING MATRICES ──
    path('open-pack/', OpenPackViews.as_view(), name='open-pack'),
    path('my-inventory/', MyInventoryView.as_view(), name='my-inventory'),
    
    # ── 3. AUTHENTICATION & IDENTITY ENGINES ──
    path('auth/signup/', views.signup_view, name='signup'),
    path('auth/login/', views.login_view, name='login'),
    path('user/profile/', views.profile_view, name='profile'),
]