from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import authenticate, login
from django.contrib import messages
from menu.models import Order  # menuアプリからOrderモデルをインポート

def staff_login(request):
    # すでにログイン済み＆スタッフならダッシュボードへ
    if request.user.is_authenticated and request.user.is_staff:
        return redirect('order_manager:dashboard')
        
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            if user.is_staff:
                login(request, user)
                return redirect('order_manager:dashboard')
            else:
                messages.error(request, 'スタッフ権限がありません')
        else:
            messages.error(request, 'ユーザー名またはパスワードが間違っています')
    
    return render(request, 'order_manager/login.html')

@staff_member_required(login_url='order_manager:login')
def dashboard(request):
    # 全ての注文を取得（最新順）
    orders = Order.objects.all().order_by('-created_at')
    any_preparing_orders = orders.filter(status__in=['pending', 'processing']).exists()
    any_ready_orders = orders.filter(status='ready').exists()
    
    return render(request, 'order_manager/dashboard.html', {
        'orders': orders,
        'any_preparing_orders': any_preparing_orders,
        'any_ready_orders': any_ready_orders,
        'title': '注文管理ダッシュボード'
    })

@staff_member_required(login_url='order_manager:login')
def update_order_status(request, order_id):
    if request.method == 'POST':
        try:
            order = Order.objects.get(id=order_id)
            new_status = request.POST.get('status')
            if new_status in dict(Order.STATUS_CHOICES):
                order.status = new_status
                order.save()
                messages.success(request, f"注文 #{order.order_number} のステータスを更新しました")
        except Order.DoesNotExist:
            messages.error(request, "注文が見つかりませんでした")
    return redirect('order_manager:dashboard')