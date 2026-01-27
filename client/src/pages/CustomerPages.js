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
import { FiShoppingCart, FiUser, FiPlus, FiMinus, FiTrash2, FiLogOut, FiMessageSquare, FiStar, FiCheck } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';

// ==================================================================
// CUSTOMER LANDING PAGE
// ==================================================================
export function CustomerLanding() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [authMode, setAuthMode] = useState('guest'); // 'guest', 'login', 'register'
    const navigate = useNavigate();
    const { user, login } = useAuth();

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

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            showToast('Email va parolni kiriting', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/customer-login', { email, password });
            login(response.data.token, response.data.user);
            showToast('Xush kelibsiz!', 'success');
            navigate('/menu');
        } catch (error) {
            showToast(error.response?.data?.error || 'Kirishda xatolik', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            showToast('Barcha maydonlarni to\'ldiring', 'error');
            return;
        }

        if (password.length < 4) {
            showToast('Parol kamida 4 ta belgidan iborat bo\'lishi kerak', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/register', { name, email, password });
            login(response.data.token, response.data.user);
            showToast('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!', 'success');
            navigate('/menu');
        } catch (error) {
            showToast(error.response?.data?.error || 'Ro\'yxatdan o\'tishda xatolik', 'error');
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

                {authMode === 'guest' && (
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

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setAuthMode('login')}
                                className="btn btn-outline btn-block text-white hover:bg-white hover:text-primary"
                            >
                                Kirish
                            </button>
                            <button
                                onClick={() => setAuthMode('register')}
                                className="btn btn-outline btn-block text-white hover:bg-white hover:text-primary"
                            >
                                Ro'yxatdan o'tish
                            </button>
                        </div>
                    </div>
                )}

                {authMode === 'login' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white text-center">Hisobingizga kiring</h3>

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-modern"
                        />

                        <input
                            type="password"
                            placeholder="Parol"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-modern"
                        />

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="btn-gradient w-full"
                        >
                            {loading ? 'Kirish...' : 'Kirish'}
                        </button>

                        <div className="flex justify-between">
                            <button
                                onClick={() => setAuthMode('guest')}
                                className="btn btn-ghost btn-sm text-white"
                            >
                                Orqaga
                            </button>
                            <button
                                onClick={() => setAuthMode('register')}
                                className="btn btn-ghost btn-sm text-white"
                            >
                                Ro'yxatdan o'tish
                            </button>
                        </div>
                    </div>
                )}

                {authMode === 'register' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white text-center">Yangi hisob yarating</h3>

                        <input
                            type="text"
                            placeholder="Ismingiz"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-modern"
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-modern"
                        />

                        <input
                            type="password"
                            placeholder="Parol (kamida 4 ta belgi)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-modern"
                        />

                        <button
                            onClick={handleRegister}
                            disabled={loading}
                            className="btn-gradient w-full"
                        >
                            {loading ? 'Ro\'yxatdan o\'tish...' : 'Ro\'yxatdan o\'tish'}
                        </button>

                        <div className="flex justify-between">
                            <button
                                onClick={() => setAuthMode('guest')}
                                className="btn btn-ghost btn-sm text-white"
                            >
                                Orqaga
                            </button>
                            <button
                                onClick={() => setAuthMode('login')}
                                className="btn btn-ghost btn-sm text-white"
                            >
                                Kirish
                            </button>
                        </div>
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
    const { user, logout } = useAuth();

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

    const handleLogout = () => {
        logout();
        navigate('/');
        showToast('Tizimdan chiqdingiz', 'info');
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-base-200 text-slate-800">
            {/* Navbar */}
            <div className="navbar bg-primary text-white shadow-lg sticky top-0 z-50">
                <div className="flex-1">
                    <h1 className="text-xl md:text-2xl font-black tracking-tighter ml-2">🌭 HOTDOG SHAHOBCHA</h1>
                </div>
                <div className="flex-none gap-1 md:gap-2">
                    <button onClick={() => navigate('/cart')} className="btn btn-ghost relative">
                        <FiShoppingCart className="w-5 h-5" />
                        {cartCount > 0 && (
                            <span className="badge badge-secondary badge-sm absolute -top-1 -right-1">{cartCount}</span>
                        )}
                    </button>
                    {user && (
                        <div className="flex gap-1 md:gap-2">
                            <button onClick={() => navigate('/profile')} className="btn btn-ghost">
                                <FiUser className="w-5 h-5" />
                            </button>
                            <button onClick={handleLogout} className="btn btn-ghost">
                                <FiLogOut className="w-5 h-5" />
                            </button>
                        </div>
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

export function OrderConfirmation() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [qrDataURL, setQrDataURL] = useState('');
    const [loading, setLoading] = useState(true);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await api.get(`/orders/${orderId}`);
                setOrder(response.data.order);
                // Generate QR code data specifically for verification scanner
                const qrPayload = JSON.stringify({
                    orderId: response.data.order._id,
                    code: response.data.order.qrCode,
                    timestamp: Date.now()
                });
                setQrDataURL(qrPayload);

                // Check if feedback already exists
                if (response.data.order.feedback) {
                    setFeedbackSubmitted(true);
                }
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
                setShowFeedbackModal(true);
            }
        });

        return () => {
            socket.off('orderUpdated');
            socket.off('orderReady');
        };
    }, [orderId]);

    const handleFeedback = async () => {
        try {
            await api.post('/feedback', { orderId, rating, comment });
            showToast('Fikringiz uchun rahmat!', 'success');
            setFeedbackSubmitted(true);
            setShowFeedbackModal(false);
        } catch (error) {
            showToast('Xatolik yuz berdi', 'error');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        showToast('Tizimdan chiqdingiz', 'info');
    };

    const getStatusText = (status) => {
        const statuses = {
            pending: 'Kutilmoqda',
            confirmed: 'Tasdiqlandi',
            preparing: 'Tayyorlanmoqda',
            ready: 'Tayyor',
            completed: 'Topshirildi'
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
        <div className="min-h-screen bg-base-200">
            <div className="navbar bg-primary text-white shadow-lg sticky top-0 z-50">
                <div className="flex-1">
                    <h1 className="text-xl md:text-2xl font-black ml-2 uppercase tracking-tighter">Buyurtma Tasdiqi</h1>
                </div>
                <div className="flex-none">
                    <button onClick={handleLogout} className="btn btn-ghost">
                        <FiLogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="card bg-base-100 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <div className="card-body text-center p-8 md:p-12">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiCheck size={40} />
                        </div>

                        <h1 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tight">Qabul Qilindi!</h1>
                        <div className="badge bg-primary border-0 text-white font-black px-4 py-3 mb-4 rounded-xl">BUYURTMA #{order.dailyNumber}</div>

                        <div className={`badge badge-lg ${getStatusColor(order.status)} border-0 text-[10px] font-black uppercase tracking-widest px-4 py-3 mb-8 rounded-lg`}>
                            {getStatusText(order.status)}
                        </div>

                        {/* QR Code Section */}
                        <div className="bg-slate-50 p-6 md:p-10 rounded-[2rem] border-2 border-dashed border-slate-200 inline-block mx-auto mb-8">
                            <div className="bg-white p-4 rounded-2xl shadow-sm">
                                <QRCodeSVG value={qrDataURL} size={200} />
                            </div>
                            <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Kassaga ko'rsating</p>
                        </div>

                        {/* Status Message */}
                        <div className="mb-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <p className="text-blue-700 font-bold italic text-sm">
                                {order.status === 'pending' && "To'lovni amalga oshirish uchun kassaga boring"}
                                {order.status === 'preparing' && "Oshpazlarimiz siz uchun mazali hot-dog tayyorlashmoqda"}
                                {order.status === 'ready' && "Buyurtmangiz tayyor! Uni olib ketishingiz mumkin"}
                            </p>
                        </div>

                        {/* Feedback Button */}
                        {(order.status === 'ready' || order.status === 'completed') && !feedbackSubmitted && (
                            <button
                                onClick={() => setShowFeedbackModal(true)}
                                className="btn btn-accent w-full rounded-2xl gap-2 font-black mb-6 animate-bounce"
                            >
                                <FiMessageSquare /> FIKR QOLDIRISH
                            </button>
                        )}

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

                        <div className="flex flex-col sm:flex-row gap-4 mt-10">
                            <button onClick={() => navigate('/menu')} className="btn btn-primary lg:btn-lg flex-1 rounded-2xl font-black shadow-lg">
                                YANA XORANDALIK
                            </button>
                            <button onClick={() => navigate('/')} className="btn btn-ghost lg:btn-lg flex-1 rounded-2xl font-bold opacity-60">
                                ASOSIY SAHIFA
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="modal modal-open bg-slate-900/40 backdrop-blur-md">
                    <div className="modal-box rounded-[2.5rem] p-10 max-w-md border border-white/10 shadow-3xl">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-6">
                                <FiMessageSquare size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Fikringiz biz uchun muhim</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Xizmat sifatini oshirishga yordam bering</p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`p-2 transition-all hover:scale-125 ${rating >= star ? 'text-amber-400' : 'text-slate-200'}`}
                                    >
                                        <FiStar size={36} fill={rating >= star ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>

                            <textarea
                                className="textarea textarea-bordered w-full h-32 rounded-2xl resize-none font-medium focus:border-primary border-slate-200 bg-slate-50"
                                placeholder="Taassurotlaringizni yozing..."
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                            ></textarea>

                            <div className="flex gap-3">
                                <button onClick={() => setShowFeedbackModal(false)} className="btn btn-ghost flex-1 rounded-2xl">YOPISH</button>
                                <button
                                    onClick={handleFeedback}
                                    className="btn btn-primary flex-2 rounded-2xl font-black shadow-lg shadow-primary/20"
                                >
                                    YUBORISH
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Continue with more pages... Due to size, I'll create template pages separately
