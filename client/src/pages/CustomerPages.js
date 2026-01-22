// ==================================================================
// HOTDOG SHAHOBCHA - ALL PAGES BUNDLE
// This file contains all page components for the application
// Each component is exported separately at the end
// ==================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import socket from '../utils/socket';
import { showToast } from '../components/shared/Toast';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { FiShoppingCart, FiUser, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';

// ==================================================================
// CUSTOMER LANDING PAGE
// ==================================================================
export function CustomerLanding() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Auto-navigate if already logged in
    useEffect(() => {
        if (user?.role === 'customer') {
            navigate('/menu');
        }
    }, [user, navigate]);

    const handleGuestOrder = () => {
        if (!name.trim()) {
            showToast('Iltimos, ismingizni kiriting', 'error');
            return;
        }
        localStorage.setItem('guestName', name);
        navigate('/menu');
    };

    const handleSendMagicLink = async () => {
        if (!name.trim() || !email.trim()) {
            showToast('Iltimos, ism va emailni kiriting', 'error');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/send-magic-link', { name, email });
            showToast('Email yuborildi! Inbox ni tekshiring', 'success');
            setShowEmailForm(false);
        } catch (error) {
            showToast(error.response?.data?.error || 'Xatolik yuz berdi', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen section-gradient flex items-center justify-center p-4">
            <div className="glass-card p-8 md:p-12 max-w-md w-full animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">🌭</h1>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Hotdog Shahobcha</h2>
                    <p className="text-white text-opacity-90">Mazali hot doglar buyurtma qiling!</p>
                </div>

                {!showEmailForm ? (
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Ismingizni kiriting"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-modern"
                        />

                        <button onClick={handleGuestOrder} className="btn-gradient w-full">
                            Buyurtma Boshlash
                        </button>

                        <div className="divider text-white">YOKI</div>

                        <button
                            onClick={() => setShowEmailForm(true)}
                            className="btn btn-outline btn-block text-white hover:bg-white hover:text-primary"
                        >
                            Email bilan kirish
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Ismingiz"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-modern"
                        />

                        <input
                            type="email"
                            placeholder="Email manzilingiz"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-modern"
                        />

                        <button
                            onClick={handleSendMagicLink}
                            disabled={loading}
                            className="btn-gradient w-full"
                        >
                            {loading ? 'Yuborilmoqda...' : 'Magic Link Yuborish'}
                        </button>

                        <button
                            onClick={() => setShowEmailForm(false)}
                            className="btn btn-ghost btn-block text-white"
                        >
                            Orqaga
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ==================================================================
// VERIFY MAGIC LINK
// ==================================================================
export function VerifyMagicLink() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [status, setStatus] = useState('verifying');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const verifyToken = async (token) => {
            try {
                const response = await api.get(`/auth/verify-magic-link/${token}`);
                login(response.data.token, response.data.user);
                showToast('Muvaffaqiyatli kirdingiz!', 'success');
                setTimeout(() => navigate('/menu'), 1000);
            } catch (error) {
                setStatus('error');
                showToast('Link yaroqsiz yoki muddati tugagan', 'error');
            }
        };

        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            return;
        }

        verifyToken(token);
    }, [searchParams, login, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card bg-base-100 shadow-xl p-8">
                {status === 'verifying' ? (
                    <LoadingSpinner text="Tekshirilmoqda..." />
                ) : (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-error mb-4">Xatolik!</h2>
                        <p className="mb-4">Link yaroqsiz yoki muddati tugagan</p>
                        <button onClick={() => navigate('/')} className="btn btn-primary">
                            Bosh sahifaga
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ==================================================================
// MENU PAGE
// ==================================================================
export function Menu() {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const navigate = useNavigate();
    const { user } = useAuth();

    const categories = [
        { value: 'all', label: 'Hammasi' },
        { value: 'classic', label: 'Klassik' },
        { value: 'premium', label: 'Premium' },
        { value: 'combo', label: 'Combo' },
        { value: 'drinks', label: 'Ichimliklar' },
        { value: 'sides', label: 'Qo\'shimcha' }
    ];

    useEffect(() => {
        fetchMenu();
        // Load cart from localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    const fetchMenu = async () => {
        try {
            const response = await api.get('/menu');
            setMenuItems(response.data.menuItems);
        } catch (error) {
            showToast('Menu yuklanmadi', 'error');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (item) => {
        const existingItem = cart.find(c => c._id === item._id);
        let newCart;

        if (existingItem) {
            newCart = cart.map(c =>
                c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c
            );
        } else {
            newCart = [...cart, { ...item, quantity: 1 }];
        }

        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        showToast(`${item.name} savatga qo'shildi`, 'success');
    };

    const filteredItems = selectedCategory === 'all'
        ? menuItems
        : menuItems.filter(item => item.category === selectedCategory);

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-base-200">
            {/* Navbar */}
            <div className="navbar bg-primary text-white shadow-lg">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">🌭 Hotdog Shahobcha</h1>
                </div>
                <div className="flex-none gap-2">
                    <button onClick={() => navigate('/cart')} className="btn btn-ghost relative">
                        <FiShoppingCart className="w-6 h-6" />
                        {cartCount > 0 && (
                            <span className="badge badge-secondary absolute -top-2 -right-2">{cartCount}</span>
                        )}
                    </button>
                    {user && (
                        <button onClick={() => navigate('/profile')} className="btn btn-ghost">
                            <FiUser className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>

            {/* Categories */}
            <div className="bg-white shadow-md p-4 overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                    {categories.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => setSelectedCategory(cat.value)}
                            className={`btn btn-sm ${selectedCategory === cat.value ? 'btn-primary' : 'btn-ghost'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Items */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                        <div key={item._id} className="card bg-base-100 shadow-xl card-hover">
                            <figure className="h-48 overflow-hidden">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </figure>
                            <div className="card-body">
                                <h2 className="card-title">{item.name}</h2>
                                <p className="text-sm text-gray-600">{item.description}</p>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-2xl font-bold text-primary">{item.price.toLocaleString()} so'm</span>
                                    <button onClick={() => addToCart(item)} className="btn btn-primary btn-sm">
                                        <FiPlus /> Qo'shish
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ==================================================================
// CART PAGE
// ==================================================================
export function Cart() {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }

        const guestName = localStorage.getItem('guestName');
        if (guestName) {
            setCustomerName(guestName);
        }

        if (user) {
            setCustomerName(user.name);
            setCustomerEmail(user.email);
        }
    }, [user]);

    const updateQuantity = (itemId, change) => {
        const newCart = cart.map(item => {
            if (item._id === itemId) {
                const newQuantity = item.quantity + change;
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
            }
            return item;
        }).filter(Boolean);

        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const removeItem = (itemId) => {
        const newCart = cart.filter(item => item._id !== itemId);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        showToast('Mahsulot o\'chirildi', 'info');
    };

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleOrder = async () => {
        if (!customerName.trim()) {
            showToast('Iltimos, ismingizni kiriting', 'error');
            return;
        }

        if (cart.length === 0) {
            showToast('Savat bo\'sh', 'error');
            return;
        }

        setLoading(true);
        try {
            const items = cart.map(item => ({
                menuItemId: item._id,
                quantity: item.quantity
            }));

            const response = await api.post('/orders', {
                customerName,
                customerEmail: customerEmail || undefined,
                items
            });

            localStorage.removeItem('cart');
            showToast('Buyurtma muvaffaqiyatli qabul qilindi!', 'success');
            navigate(`/order-confirmation/${response.data.order._id}`);
        } catch (error) {
            showToast(error.response?.data?.error || 'Buyurtma yuborishda xatolik', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-200">
            <div className="navbar bg-primary text-white">
                <button onClick={() => navigate('/menu')} className="btn btn-ghost">
                    ← Orqaga
                </button>
                <h1 className="flex-1 text-center text-2xl font-bold">Savat</h1>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {cart.length === 0 ? (
                    <div className="card bg-base-100 shadow-xl p-12 text-center">
                        <h2 className="text-2xl font-bold mb-4">Savat bo'sh</h2>
                        <button onClick={() => navigate('/menu')} className="btn btn-primary">
                            Menyuga qaytish
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Cart Items */}
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title mb-4">Buyurtmalar</h2>
                                <div className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item._id} className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                                            <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                                            <div className="flex-1">
                                                <h3 className="font-bold">{item.name}</h3>
                                                <p className="text-primary font-semibold">{item.price.toLocaleString()} so'm</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => updateQuantity(item._id, -1)} className="btn btn-sm btn-circle">
                                                    <FiMinus />
                                                </button>
                                                <span className="font-bold w-8 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item._id, 1)} className="btn btn-sm btn-circle">
                                                    <FiPlus />
                                                </button>
                                            </div>
                                            <button onClick={() => removeItem(item._id)} className="btn btn-ghost btn-sm text-error">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title mb-4">Ma'lumotlaringiz</h2>
                                <input
                                    type="text"
                                    placeholder="Ismingiz"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="input-modern"
                                />
                                {!user && (
                                    <input
                                        type="email"
                                        placeholder="Email (ixtiyoriy)"
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        className="input-modern"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Total */}
                        <div className="card bg-primary text-white shadow-xl">
                            <div className="card-body">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xl font-bold">Jami:</span>
                                    <span className="text-3xl font-bold">{totalPrice.toLocaleString()} so'm</span>
                                </div>
                                <button onClick={handleOrder} disabled={loading} className="btn btn-accent btn-lg w-full">
                                    {loading ? 'Yuborilmoqda...' : 'Buyurtma Berish'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ==================================================================
// ORDER CONFIRMATION PAGE
// ==================================================================
export function OrderConfirmation() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [qrDataURL, setQrDataURL] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await api.get(`/orders/${orderId}`);
                setOrder(response.data.order);
                // Generate QR code
                const qrData = JSON.stringify({
                    orderId: response.data.order._id,
                    code: response.data.order.qrCode,
                    timestamp: Date.now()
                });
                setQrDataURL(qrData);
            } catch (error) {
                showToast('Buyurtma topilmadi', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();

        // Listen for order updates
        socket.on('orderUpdated', (updatedOrder) => {
            if (updatedOrder._id === orderId) {
                setOrder(updatedOrder);
            }
        });

        socket.on('orderReady', (readyOrder) => {
            if (readyOrder._id === orderId) {
                setOrder(readyOrder);
                showToast('🎉 Buyurtmangiz tayyor!', 'success');
                // Show feedback modal here (implement later)
            }
        });

        return () => {
            socket.off('orderUpdated');
            socket.off('orderReady');
        };
    }, [orderId]);

    const getStatusText = (status) => {
        const statuses = {
            pending: 'Kutilmoqda',
            confirmed: 'Tasdiqlandi',
            preparing: 'Tayyorlanmoqda',
            ready: 'Tayyor',
            completed: 'Yakunlandi'
        };
        return statuses[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'badge-warning',
            confirmed: 'badge-info',
            preparing: 'badge-primary',
            ready: 'badge-success',
            completed: 'badge-neutral'
        };
        return colors[status] || 'badge-ghost';
    };

    if (loading) return <LoadingSpinner />;
    if (!order) return <div>Buyurtma topilmadi</div>;

    return (
        <div className="min-h-screen bg-base-200 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body text-center">
                        <h1 className="text-4xl font-bold text-success mb-2">✅ Buyurtma Qabul Qilindi!</h1>
                        <div className="badge badge-lg badge-primary mb-4">Buyurtma #{order.dailyNumber}</div>

                        <div className={`badge badge-lg ${getStatusColor(order.status)} mb-6`}>
                            {getStatusText(order.status)}
                        </div>

                        {/* QR Code */}
                        <div className="bg-white p-8 rounded-xl inline-block mx-auto mb-6">
                            <QRCodeSVG value={qrDataURL} size={256} />
                        </div>

                        <p className="text-lg mb-6">
                            Bu QR kodni hodimga ko'rsating yoki buyurtmangiz tayyor bo'lganda oling
                        </p>

                        {/* Order Details */}
                        <div className="text-left bg-base-200 p-6 rounded-lg mb-6">
                            <h3 className="font-bold text-lg mb-3">Buyurtma tafsilotlari:</h3>
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between py-2 border-b border-base-300">
                                    <span>{item.menuItem.name} x{item.quantity}</span>
                                    <span className="font-semibold">{(item.price * item.quantity).toLocaleString()} so'm</span>
                                </div>
                            ))}
                            <div className="flex justify-between pt-4 text-xl font-bold">
                                <span>Jami:</span>
                                <span className="text-primary">{order.totalPrice.toLocaleString()} so'm</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => navigate('/menu')} className="btn btn-primary flex-1">
                                Yana buyurtma berish
                            </button>
                            <button onClick={() => navigate('/')} className="btn btn-ghost flex-1">
                                Bosh sahifa
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Continue with more pages... Due to size, I'll create template pages separately
