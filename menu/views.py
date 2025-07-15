from django.shortcuts import render, redirect
from .forms import OrderForm
from .models import MenuItem, Order, OrderItem
from django.http import JsonResponse
import json
from decimal import Decimal

def menu_list(request):
    items = MenuItem.objects.all()
    return render(request, 'menu/menu_list.html', {'items': items})

def order_view(request):
    if request.method == 'POST':
        form = OrderForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('menu_list')  # または "thank_you" ページ
    else:
        form = OrderForm()
    return render(request, 'menu/order.html', {'form': form})

def place_order(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            cart_items = data.get('cart_items', [])
            
            # カートが空かどうかをサーバー側でもチェック
            if not cart_items:
                return JsonResponse({'success': False, 'error': 'カートが空です'})
            
            # 合計金額の計算
            total_price = Decimal('0.00')
            for item in cart_items:
                menu_item = MenuItem.objects.get(id=item['id'])
                total_price += menu_item.price * Decimal(str(item['quantity']))
            
            # 注文の作成
            order = Order.objects.create(total_price=total_price)
            
            # 注文アイテムの作成
            for item in cart_items:
                menu_item = MenuItem.objects.get(id=item['id'])
                OrderItem.objects.create(
                    order=order,
                    menu_item=menu_item,
                    item_name=menu_item.name,
                    quantity=item['quantity'],
                    price=menu_item.price
                )
            
            print(f"Order created with ID: {order.id}, Number: {order.order_number}")
            
            return JsonResponse({
                'success': True, 
                'order_number': order.order_number
            })
            
        except Exception as e:
            import traceback
            print(f"Error processing order: {e}")
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'})
