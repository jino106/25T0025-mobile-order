# menu/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.menu_list, name='menu_list'),
    path('order/', views.order_view, name='order'),
    path('place-order/', views.place_order, name='place_order'),
]
