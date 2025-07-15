document.addEventListener('DOMContentLoaded', function() {
    console.log('メニューJSが読み込まれました');
    
    // メニュー項目の取得
    const menuItems = document.querySelectorAll('.menu-item');
    const popup = document.querySelector('.popup');
    const popupOverlay = document.querySelector('.popup-overlay');
    const popupItemName = document.getElementById('popup-item-name');
    const popupItemPrice = document.getElementById('popup-item-price');
    const quantityInput = document.getElementById('quantity');
    const totalPriceElement = document.getElementById('total-price');
    const cancelButton = document.querySelector('.popup-buttons .cancel');
    const addToCartButton = document.querySelector('.popup-buttons .add-to-cart');
    const cartButton = document.querySelector('.cart-button');
    const cartPopup = document.querySelector('.cart-popup');
    const cartItemsList = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const closeCartButton = document.querySelector('.cart-popup-buttons .close');
    const orderButton = document.querySelector('.cart-popup-buttons .order');
    
    // カートの配列
    let cart = [];
    let selectedItem = null;
    
    // メニュー項目クリックイベント
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            
            selectedItem = { id, name, price };
            
            popupItemName.textContent = name;
            popupItemPrice.textContent = price;
            quantityInput.value = 1;
            updateTotalPrice();
            
            popup.style.display = 'block';
            popupOverlay.style.display = 'block';
        });
    });
    
    // 合計価格更新・カート関連の実装
    function updateTotalPrice() {
        const quantity = parseInt(quantityInput.value) || 0;
        const price = parseFloat(popupItemPrice.textContent) || 0;
        totalPriceElement.textContent = (quantity * price).toFixed(0);
    }
    
    // 数量変更イベント
    quantityInput.addEventListener('input', updateTotalPrice);
    
    // キャンセルボタン
    cancelButton.addEventListener('click', function() {
        popup.style.display = 'none';
        popupOverlay.style.display = 'none';
    });
    
    // カートに追加
    addToCartButton.addEventListener('click', function() {
        const quantity = parseInt(quantityInput.value) || 0;
        if (quantity > 0 && selectedItem) {
            const existingItem = cart.find(item => item.id === selectedItem.id);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({...selectedItem, quantity: quantity});
            }
            updateCart();
            popup.style.display = 'none';
            popupOverlay.style.display = 'none';
        }
    });
    
    // カート表示
    cartButton.addEventListener('click', function() {
        cartPopup.style.display = 'block';
        updateCart();
    });
    
    // カートを閉じる
    closeCartButton.addEventListener('click', function() {
        cartPopup.style.display = 'none';
    });
    
    // カート更新
    function updateCart() {
        cartItemsList.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            const li = document.createElement('li');
            const itemTotal = item.price * item.quantity;
            li.textContent = `${item.name} x ${item.quantity} = ¥${itemTotal.toFixed(0)}`;
            cartItemsList.appendChild(li);
            total += itemTotal;
        });
        cartTotalElement.textContent = total.toFixed(0);
    }
    
    // 注文処理
    orderButton.addEventListener('click', function() {
        console.log('注文ボタンがクリックされました');
        console.log('現在のカート:', cart);
        
        if (cart.length === 0) {
            console.log('カートが空のため注文をキャンセルします');
            alert('カートに商品がありません');
            return;
        }
        
        const cartItems = cart.map(item => ({
            id: item.id,
            quantity: item.quantity
        }));
        
        const orderData = { cart_items: cartItems };
        console.log('注文データ:', orderData);
        
        fetch('/menu/place-order/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('レスポンスデータ:', data);
            if (data.success) {
                alert(`ご注文ありがとうございます！注文番号: ${data.order_number}`);
                cart = [];
                updateCart();
                cartPopup.style.display = 'none';
            } else {
                alert('注文処理中にエラーが発生しました: ' + data.error);
            }
        })
        .catch(error => {
            console.error('エラー:', error);
            alert('注文処理中にエラーが発生しました');
        });
    });
    
    // CSRFトークン取得
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    // デバッグ用コード - 要素の存在確認
    console.log('menuItems:', document.querySelectorAll('.menu-item'));
    console.log('popup:', document.querySelector('.popup'));
    console.log('cartButton:', document.querySelector('.cart-button'));
    console.log('orderButton:', document.querySelector('.cart-popup-buttons .order'));
});