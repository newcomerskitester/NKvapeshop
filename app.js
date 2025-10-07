// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand(); // Раскрываем на весь экран

// Данные товаров (в реальном приложении получаем с сервера)
let products = [
    {
        id: 1,
        name: "Смартфон",
        description: "Мощный смартфон с отличной камерой",
        price: 299.99,
        emoji: "📱"
    },
    {
        id: 2,
        name: "Наушники",
        description: "Беспроводные наушники с шумоподавлением",
        price: 99.99,
        emoji: "🎧"
    },
    {
        id: 3,
        name: "Умные часы",
        description: "Фитнес-трекер и умные часы",
        price: 199.99,
        emoji: "⌚"
    },
    {
        id: 4,
        name: "Ноутбук",
        description: "Игровой ноутбук с мощной видеокартой",
        price: 1299.99,
        emoji: "💻"
    },
    {
        id: 5,
        name: "Планшет",
        description: "Планшет для работы и развлечений",
        price: 499.99,
        emoji: "📱"
    },
    {
        id: 6,
        name: "Фотокамера",
        description: "Зеркальная камера для профессиональной съемки",
        price: 899.99,
        emoji: "📷"
    }
];

// Корзина
let cart = JSON.parse(localStorage.getItem('cart')) || {};

// Инициализация приложения
function initApp() {
    showProducts();
    updateCartCount();
    
    // Используем тему Telegram
    document.body.style.backgroundColor = tg.themeParams.bg_color || '#ffffff';
    document.body.style.color = tg.themeParams.text_color || '#000000';
}

// Показать список товаров
function showProducts() {
    switchView('products-view');
    renderProducts();
}

// Показать корзину
function showCart() {
    switchView('cart-view');
    renderCart();
}

// Переключение между экранами
function switchView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
}

// Рендер товаров
function renderProducts() {
    const productsList = document.getElementById('products-list');
    productsList.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.onclick = () => showProductDetail(product);
        
        productCard.innerHTML = `
            <div class="product-image">${product.emoji}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">$${product.price}</div>
        `;
        
        productsList.appendChild(productCard);
    });
}

// Показать детали товара
function showProductDetail(product) {
    const detailView = document.getElementById('product-detail-view');
    detailView.innerHTML = `
        <div class="cart-header">
            <button onclick="showProducts()">← Назад</button>
            <h2>${product.name}</h2>
        </div>
        <div style="text-align: center; margin: 20px 0;">
            <div style="font-size: 4em; margin-bottom: 20px;">${product.emoji}</div>
            <h3>${product.name}</h3>
            <p style="margin: 15px 0; color: #666;">${product.description}</p>
            <div style="font-size: 1.5em; font-weight: bold; color: #4a76a8; margin: 20px 0;">
                $${product.price}
            </div>
            <button onclick="addToCart(${product.id})" 
                    style="background: #4a76a8; color: white; border: none; padding: 15px 30px; 
                           border-radius: 8px; font-size: 1.1em; cursor: pointer;">
                Добавить в корзину
            </button>
        </div>
    `;
    switchView('product-detail-view');
}

// Добавить в корзину
function addToCart(productId) {
    if (cart[productId]) {
        cart[productId].quantity += 1;
    } else {
        const product = products.find(p => p.id === productId);
        cart[productId] = {
            ...product,
            quantity: 1
        };
    }
    
    saveCart();
    updateCartCount();
    tg.HapticFeedback.impactOccurred('light'); // Тактильный отклик
    showProducts(); // Возвращаемся к списку товаров
}

// Рендер корзины
function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    
    cartItems.innerHTML = '';
    let totalPrice = 0;

    Object.values(cart).forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <div>$${item.price} x ${item.quantity} = $${itemTotal.toFixed(2)}</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    totalPriceElement.textContent = totalPrice.toFixed(2);
}

// Обновить количество товара
function updateQuantity(productId, change) {
    if (cart[productId]) {
        cart[productId].quantity += change;
        
        if (cart[productId].quantity <= 0) {
            delete cart[productId];
        }
        
        saveCart();
        updateCartCount();
        renderCart();
    }
}

// Обновить счетчик корзины
function updateCartCount() {
    const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

// Сохранить корзину
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Оформление заказа
function checkout() {
    if (Object.keys(cart).length === 0) {
        tg.showPopup({
            title: 'Корзина пуста',
            message: 'Добавьте товары в корзину перед оформлением заказа'
        });
        return;
    }

    const total = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // В реальном приложении здесь будет интеграция с платежной системой
    tg.showConfirm(`Подтвердите заказ на сумму $${total.toFixed(2)}?`, (confirmed) => {
        if (confirmed) {
            // Отправляем данные заказа в бота
            tg.sendData(JSON.stringify({
                action: 'checkout',
                cart: cart,
                total: total,
                user: tg.initDataUnsafe.user
            }));
            
            // Очищаем корзину
            cart = {};
            saveCart();
            updateCartCount();
            
            tg.showPopup({
                title: 'Заказ оформлен!',
                message: 'С вами свяжется менеджер для уточнения деталей'
            });
            
            showProducts();
        }
    });
}

// Фильтрация товаров
function filterProducts() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    
    const productsList = document.getElementById('products-list');
    productsList.innerHTML = '';
    
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.onclick = () => showProductDetail(product);
        
        productCard.innerHTML = `
            <div class="product-image">${product.emoji}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">$${product.price}</div>
        `;
        
        productsList.appendChild(productCard);
    });
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initApp);