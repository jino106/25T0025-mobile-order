# order_manager/middleware.py
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib import messages

class StaffRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # /staff/ で始まるパスはスタッフ専用
        if request.path.startswith('/staff/') and not request.path.endswith('/login/'):
            if not request.user.is_authenticated:
                messages.warning(request, "ログインが必要です")
                return HttpResponseRedirect(reverse('order_manager:login'))
            elif not request.user.is_staff:
                messages.error(request, "スタッフ権限が必要です")
                return HttpResponseRedirect(reverse('home'))
        
        return self.get_response(request)