# order_manager/urls.py
from django.urls import path
from . import views

app_name = 'order_manager'

urlpatterns = [
    path('login/', views.staff_login, name='login'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('order/<int:order_id>/update/', views.update_order_status, name='update_order'),
    path('history/', views.order_history, name='order_history'),  # 注文履歴ページ用のパスを追加
]