# menu/forms.py
from django import forms
from .models import Order, OrderItem

# 注文全体のフォーム
class OrderForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ['order_number']  # Orderモデルの実際のフィールド

# 注文アイテムのフォーム（必要に応じて）
class OrderItemForm(forms.ModelForm):
    class Meta:
        model = OrderItem
        fields = ['menu_item', 'quantity']  # OrderItemモデルのフィールド
