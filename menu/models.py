from django.db import models
import uuid
from django.utils import timezone

def generate_order_number():
    """UUIDを使った短い注文番号の生成"""
    # uuid4の最初の8文字を使用
    return str(uuid.uuid4()).split('-')[0]

class MenuItem(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='menu_images/', blank=True)

    def __str__(self):
        return self.name
    
class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', '注文受付'),
        ('processing', '調理中'),
        ('ready', '準備完了'),
        ('completed', '受け渡し完了'),
        ('canceled', 'キャンセル')
    ]
    order_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    def __str__(self):
        return f"注文 #{self.order_number}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = generate_order_number()
        super().save(*args, **kwargs)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.PROTECT)
    item_name = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    
    def __str__(self):
        return f"{self.item_name} x{self.quantity}"