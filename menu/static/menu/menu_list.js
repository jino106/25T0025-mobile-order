document.addEventListener('DOMContentLoaded', function() {
    console.log('Menu JS loaded');
    
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
    
    // カート更新（新しいフォーマット）
    function updateCart() {
        cartItemsList.innerHTML = '';
        let total = 0;
        
        cart.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'cart-item';
            
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            // 商品情報の表示形式を変更
            li.innerHTML = `
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-quantity">x${item.quantity}</span>
                    <span class="item-price">¥${itemTotal.toFixed(0)}</span>
                </div>
                <button class="cancel-item-btn" data-index="${index}">Cancel</button>
            `;
            
            cartItemsList.appendChild(li);
        });
        
        // カートが空の場合のメッセージ
        if (cart.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'Cart is empty';
            emptyMessage.className = 'empty-cart';
            cartItemsList.appendChild(emptyMessage);
        }
        
        cartTotalElement.textContent = total.toFixed(0);
        
        // アイテム削除ボタンにイベントリスナーを追加
        const cancelButtons = document.querySelectorAll('.cancel-item-btn');
        cancelButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                cart.splice(index, 1);
                updateCart();
            });
        });
    }
    
    // 注文処理
    orderButton.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }
        
        const cartItems = cart.map(item => ({
            id: item.id,
            quantity: item.quantity
        }));
        
        const orderData = { cart_items: cartItems };
        
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
            if (data.success) {
                alert(`Thank you for your order! Order number: ${data.order_number}`);
                cart = [];
                updateCart();
                cartPopup.style.display = 'none';
            } else {
                alert('An error occurred while processing your order: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while processing your order');
        });
    });
    
    // CSRFトークン取得関数
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
});