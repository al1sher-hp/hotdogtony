// ==================================================================
// HOTDOG SHAHOBCHA - ALL PAGES BUNDLE
// ==================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import socket from '../utils/socket';
import { showToast } from '../components/shared/Toast';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { FiShoppingCart, FiUser, FiPlus, FiMinus, FiTrash2, FiMessageSquare, FiStar, FiCheck, FiSun, FiMoon, FiArrowRight, FiUserPlus, FiLogIn, FiClock } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';

// ==================================================================
// CUSTOMER LANDING PAGE
// ==================================================================
export function CustomerLanding({ theme, toggleTheme }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [authMode, setAuthMode] = useState('guest'); // 'guest', 'login', 'register'
    const navigate = useNavigate();
    const { user, login } = useAuth();

    useEffect(() => {
        if (user?.role === 'customer') navigate('/menu');
    }, [user, navigate]);

    const handleGuestOrder = () => {
        if (!name.trim()) return showToast('Iltimos, ismingizni kiriting', 'error');
        localStorage.setItem('guestName', name);
        navigate('/menu');
    };

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) return showToast('Email va parolni kiriting', 'error');
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
        if (!name.trim() || !email.trim() || !password.trim()) return showToast('Barcha maydonlarni to\'ldiring', 'error');
        if (password.length < 4) return showToast('Parol kamida 4 ta belgidan iborat bo\'lishi kerak', 'error');
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
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
            {/* Background elements for Premium feel */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[140px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[140px] animate-pulse-slow"></div>

            <div className="absolute top-6 right-6 z-20">
                <button onClick={toggleTheme} className="btn btn-ghost btn-circle shadow-lg bg-base-100/50 backdrop-blur-md hover:bg-base-100 transition-all border border-base-content/5">
                    {theme === 'dark' ? <FiSun size={20} className="text-yellow-400" /> : <FiMoon size={20} className="text-indigo-600" />}
                </button>
            </div>

            <div className="card w-full max-w-md bg-base-100/80 backdrop-blur-3xl shadow-2xl rounded-[3rem] p-8 md:p-12 border border-base-content/5 animate-in fade-in zoom-in duration-700 relative z-10">
                <div className="text-center mb-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-12 group hover:rotate-0 transition-all duration-500 ring-4 ring-white/10">
                        <span className="text-6xl drop-shadow-xl">🌭</span>
                    </div>
                    <h2 className="text-4xl font-black text-base-content mb-2 tracking-tighter uppercase">Hotdog Tony</h2>
                    <p className="text-base-content/50 font-bold tracking-widest text-[10px] uppercase">Gourmet Street Food Experience</p>
                </div>

                <div className="space-y-6">
                    {authMode === 'guest' && (
                        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                            <input
                                type="text"
                                placeholder="Ismingizni kiriting"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input input-bordered w-full h-14 rounded-2xl bg-base-200/50 border-0 focus:ring-2 focus:ring-primary font-bold px-6 text-base-content"
                            />
                            <button onClick={handleGuestOrder} className="btn btn-primary w-full h-14 rounded-2xl font-black uppercase shadow-xl shadow-primary/20 text-white gap-2">
                                Buyurtma Boshlash <FiArrowRight />
                            </button>

                            <div className="divider text-[10px] font-black uppercase opacity-20 tracking-widest">Yoki</div>

                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setAuthMode('login')} className="btn btn-outline btn-sm rounded-xl font-black uppercase text-[10px] tracking-widest gap-2">
                                    <FiLogIn size={14} /> Kirish
                                </button>
                                <button onClick={() => setAuthMode('register')} className="btn btn-outline btn-sm rounded-xl font-black uppercase text-[10px] tracking-widest gap-2">
                                    <FiUserPlus size={14} /> RO'YXATDAN
                                </button>
                            </div>
                        </div>
                    )}

                    {authMode === 'login' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input input-bordered w-full h-14 rounded-2xl bg-base-200/50 border-0 focus:ring-2 focus:ring-primary font-bold px-6 text-base-content" />
                            <input type="password" placeholder="Parol" value={password} onChange={(e) => setPassword(e.target.value)} className="input input-bordered w-full h-14 rounded-2xl bg-base-200/50 border-0 focus:ring-2 focus:ring-primary font-bold px-6 text-base-content" />
                            <button onClick={handleLogin} disabled={loading} className="btn btn-primary w-full h-14 rounded-2xl font-black uppercase shadow-xl shadow-primary/20 text-white">
                                {loading ? <span className="loading loading-spinner"></span> : 'Kirish'}
                            </button>
                            <button onClick={() => setAuthMode('guest')} className="btn btn-ghost btn-sm w-full font-bold opacity-40 uppercase tracking-widest text-[10px]">Orqaga</button>
                        </div>
                    )}

                    {authMode === 'register' && (
                        <div className="space-y-4 animate-in slide-in-from-left-4 duration-500">
                            <input type="text" placeholder="Ism-sharif" value={name} onChange={(e) => setName(e.target.value)} className="input input-bordered w-full h-14 rounded-2xl bg-base-200/50 border-0 focus:ring-2 focus:ring-primary font-bold px-6 text-base-content" />
                            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input input-bordered w-full h-14 rounded-2xl bg-base-200/50 border-0 focus:ring-2 focus:ring-primary font-bold px-6 text-base-content" />
                            <input type="password" placeholder="Parol" value={password} onChange={(e) => setPassword(e.target.value)} className="input input-bordered w-full h-14 rounded-2xl bg-base-200/50 border-0 focus:ring-2 focus:ring-primary font-bold px-6 text-base-content" />
                            <button onClick={handleRegister} disabled={loading} className="btn btn-primary w-full h-14 rounded-2xl font-black uppercase shadow-xl shadow-primary/20 text-white">
                                {loading ? <span className="loading loading-spinner"></span> : 'Ro\'yxatdan o\'tish'}
                            </button>
                            <button onClick={() => setAuthMode('guest')} className="btn btn-ghost btn-sm w-full font-bold opacity-40 uppercase tracking-widest text-[10px]">Orqaga</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ==================================================================
// MENU PAGE
// ==================================================================
export function Menu({ theme, toggleTheme }) {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const categories = [
        { value: 'all', label: 'BARCHASI' },
        { value: 'classic', label: 'KLASSIK' },
        { value: 'premium', label: 'PREMIUM' },
        { value: 'combo', label: 'COMBO' },
        { value: 'drinks', label: 'ICHIMLIKLAR' },
        { value: 'sides', label: 'QO\'SHIMCHA' }
    ];

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await api.get('/menu');
                setMenuItems(response.data.menuItems);
            } catch (error) {
                showToast('Menyuni yuklashda xatolik', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
        const savedCart = localStorage.getItem('cart');
        if (savedCart) setCart(JSON.parse(savedCart));
    }, []);

    const addToCart = (item) => {
        const existingItem = cart.find(c => c._id === item._id);
        const newCart = existingItem
            ? cart.map(c => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c)
            : [...cart, { ...item, quantity: 1 }];
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        showToast(`${item.name} qo'shildi`, 'success');
    };

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const filteredItems = selectedCategory === 'all' ? menuItems : menuItems.filter(item => item.category === selectedCategory);

    const handleLogout = () => {
        logout();
        navigate('/');
        showToast('Tizimdan chiqdingiz', 'info');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-base-200"><LoadingSpinner /></div>;

    return (
        <div className="min-h-screen bg-base-200 transition-colors duration-500">
            <nav className="navbar bg-base-100/80 border-b border-base-content/5 sticky top-0 z-50 backdrop-blur-xl px-6 h-20">
                <div className="flex-1">
                    <button onClick={() => navigate('/')} className="flex items-center gap-3 group">
                        <div className="bg-primary p-2.5 rounded-2xl text-white shadow-xl shadow-primary/20 group-hover:scale-110 transition-all duration-500">
                            <span className="text-2xl">🌭</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tighter uppercase text-base-content ml-1">Hotdog Tony</h1>
                    </button>
                </div>
                <div className="flex gap-2">
                    <button onClick={toggleTheme} className="btn btn-ghost btn-circle btn-sm bg-base-200/50 hover:bg-base-200">
                        {theme === 'dark' ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-indigo-600" />}
                    </button>

                    <div className="h-6 w-[1px] bg-base-content/10 mx-1"></div>

                    <button onClick={() => navigate('/cart')} className="btn btn-ghost btn-circle relative bg-base-200/50 hover:bg-base-200">
                        <FiShoppingCart className="w-5 h-5 text-base-content" />
                        {cartCount > 0 && <span className="badge badge-primary font-bold absolute -top-1 -right-1 border-2 border-base-100 animate-pulse text-[10px]">{cartCount}</span>}
                    </button>

                    {user && (
                        <>
                            <button onClick={() => navigate('/profile')} className="btn btn-ghost btn-circle bg-base-200/50 hover:bg-base-200">
                                <FiUser className="w-5 h-5 text-base-content" />
                            </button>
                            <button onClick={handleLogout} className="btn btn-ghost btn-circle text-error bg-error/5 hover:bg-error/10">
                                <FiTrash2 className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </nav>

            <div className="bg-base-100/50 backdrop-blur-md sticky top-20 z-40 border-b border-base-content/5 py-4 overflow-x-auto">
                <div className="container mx-auto flex gap-3 min-w-max justify-center px-4">
                    {categories.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => setSelectedCategory(cat.value)}
                            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${selectedCategory === cat.value ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'bg-base-300/50 text-base-content/40 hover:bg-base-300 hover:text-base-content'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <main className="container mx-auto p-8 max-w-7xl animate-in fade-in duration-1000">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredItems.map(item => (
                        <div key={item._id} className="card bg-base-100 border border-base-content/5 hover:border-primary/20 hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden group hover:-translate-y-2">
                            <figure className="h-56 overflow-hidden relative">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute top-4 right-4 badge bg-black/50 backdrop-blur-md border-0 text-white font-black text-[9px] px-3 py-2.5 rounded-xl uppercase tracking-widest">{item.category}</div>
                            </figure>
                            <div className="card-body p-8">
                                <h2 className="card-title font-black uppercase text-lg tracking-tight text-base-content leading-none mb-1">{item.name}</h2>
                                <p className="text-[11px] font-medium opacity-40 line-clamp-2 h-8 leading-relaxed italic mb-4">{item.description}</p>
                                <div className="flex justify-between items-center mt-auto bg-base-200/50 p-3 rounded-2xl border border-base-content/5">
                                    <div className="flex flex-col">
                                        <span className="text-xl font-black text-primary tracking-tighter">{(item.price || 0).toLocaleString()}</span>
                                        <span className="text-[9px] font-black opacity-30 uppercase tracking-widest leading-none">so'm</span>
                                    </div>
                                    <button onClick={() => addToCart(item)} className="btn btn-primary btn-sm rounded-xl px-5 font-black text-white shadow-lg shadow-primary/20 hover:scale-110 transition-transform">
                                        <FiPlus size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {filteredItems.length === 0 && (
                    <div className="text-center py-24 opacity-20 italic font-black uppercase tracking-widest">Hozircha mahsulotlar mavjud emas...</div>
                )}
            </main>
        </div>
    );
}

// ==================================================================
// CART PAGE
// ==================================================================
export function Cart({ theme, toggleTheme }) {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) setCart(JSON.parse(savedCart));
        if (user) setCustomerName(user.name);
        else {
            const guest = localStorage.getItem('guestName');
            if (guest) setCustomerName(guest);
        }
    }, [user]);

    const updateQuantity = (id, delta) => {
        const updated = cart.map(i => i._id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i);
        setCart(updated);
        localStorage.setItem('cart', JSON.stringify(updated));
    };

    const removeItem = (id) => {
        const updated = cart.filter(i => i._id !== id);
        setCart(updated);
        localStorage.setItem('cart', JSON.stringify(updated));
        showToast('Savatdan olib tashlandi', 'info');
    };

    const totalPrice = cart.reduce((s, i) => s + (i.price * i.quantity), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return showToast('Savatchangiz bo\'sh', 'error');
        setLoading(true);
        try {
            const res = await api.post('/orders', {
                customerName,
                items: cart.map(i => ({ menuItem: i._id, quantity: i.quantity, price: i.price })),
                totalPrice
            });
            localStorage.removeItem('cart');
            showToast('Buyurtma muvaffaqiyatli berildi!', 'success');
            navigate(`/order-confirmation/${res.data.order._id}`);
        } catch (error) {
            showToast('Xatolik yuz berdi: ' + (error.response?.data?.error || ''), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        showToast('Tizimdan chiqdingiz', 'info');
    };

    return (
        <div className="min-h-screen bg-base-200 transition-colors duration-500">
            <nav className="navbar bg-base-100 border-b border-base-content/5 px-6 sticky top-0 z-50 h-20 backdrop-blur-xl bg-opacity-80">
                <div className="flex-1">
                    <button onClick={() => navigate('/menu')} className="btn btn-ghost btn-sm px-4 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2">
                        ← MENYUGA QAYTISH
                    </button>
                </div>
                <div className="flex-none flex gap-2">
                    <button onClick={toggleTheme} className="btn btn-ghost btn-circle btn-sm bg-base-200/50">
                        {theme === 'dark' ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-indigo-600" />}
                    </button>
                    <button onClick={handleLogout} className="btn btn-ghost btn-circle btn-sm text-error bg-error/5 hover:bg-error/10">
                        <FiTrash2 className="w-4 h-4" />
                    </button>
                </div>
            </nav>

            <div className="container mx-auto p-4 lg:p-12 max-w-6xl animate-in fade-in duration-700">
                <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-4xl font-black uppercase tracking-tighter text-base-content mb-8">Savatchangiz</h2>

                        {cart.length === 0 ? (
                            <div className="card bg-base-100 p-20 text-center rounded-[3rem] border border-dashed border-base-content/20">
                                <span className="text-8xl mb-6 grayscale opacity-10">🛒</span>
                                <p className="font-black opacity-20 uppercase tracking-widest text-sm">Savatchangiz bo'sh...</p>
                                <button onClick={() => navigate('/menu')} className="btn btn-primary btn-sm mt-8 rounded-xl px-8 shadow-xl shadow-primary/20 text-white">XARIDLARNI BOSHLASH</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map(item => (
                                    <div key={item._id} className="card bg-base-100 p-6 border border-base-content/5 rounded-[2.5rem] flex flex-row items-center gap-6 shadow-sm hover:shadow-xl transition-all duration-500 group">
                                        <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden shadow-inner flex-shrink-0">
                                            <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-black text-sm uppercase tracking-tight text-base-content mb-1 leading-none">{item.name}</h3>
                                            <p className="text-primary font-black text-base tracking-tighter">{(item.price || 0).toLocaleString()} <small className="text-[10px] opacity-40 uppercase">so'm</small></p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-base-200 p-2 rounded-2xl">
                                            <button onClick={() => updateQuantity(item._id, -1)} className="btn btn-ghost btn-xs btn-circle bg-base-100 shadow-sm hover:bg-white"><FiMinus size={10} /></button>
                                            <span className="font-black text-xs w-6 text-center text-base-content">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item._id, 1)} className="btn btn-ghost btn-xs btn-circle bg-base-100 shadow-sm hover:bg-white"><FiPlus size={10} /></button>
                                        </div>
                                        <button onClick={() => removeItem(item._id)} className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error/10"><FiTrash2 size={18} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Order Summary Form */}
                    <div className="card bg-base-100 shadow-4xl p-10 rounded-[3rem] h-fit sticky top-28 border border-base-content/5 border-t-primary border-t-8 overflow-hidden">
                        <div className="absolute top-[-5%] left-[-5%] w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-base-content mb-10 pb-4 border-b border-base-content/5 relative z-10">Xulosa</h2>

                        <div className="space-y-8 relative z-10">
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black opacity-30 uppercase tracking-widest leading-none">Jami Summa</span>
                                    <span className="text-3xl font-black text-primary tracking-tighter mt-1">{totalPrice.toLocaleString()}</span>
                                </div>
                                <span className="text-xs font-black opacity-40 uppercase mb-1">so'm</span>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text text-[10px] font-black uppercase opacity-40 tracking-widest ml-1">Qabul qiluvchi ismi</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full h-14 rounded-2xl font-bold bg-base-200/50 border-0 focus:ring-2 focus:ring-primary text-base-content text-lg px-6"
                                        placeholder="Ismingizni yozing..."
                                        value={customerName}
                                        onChange={e => setCustomerName(e.target.value)}
                                        required
                                    />
                                </div>

                                <button type="submit" disabled={loading || cart.length === 0} className="btn btn-primary w-full h-16 rounded-2xl font-black text-lg text-white shadow-2xl shadow-primary/30 mt-4 uppercase tracking-tight gap-2 group">
                                    {loading ? <span className="loading loading-spinner"></span> : <>Tasdiqlash <FiCheck size={20} className="group-hover:scale-125 transition-transform" /></>}
                                </button>
                                <p className="text-[10px] text-center opacity-30 font-bold uppercase tracking-widest leading-relaxed">Tayyorlanish vaqti: 10-15 daqiqa</p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==================================================================
// ORDER CONFIRMATION PAGE
// ==================================================================
export function OrderConfirmation({ theme, toggleTheme }) {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [qrDataURL, setQrDataURL] = useState('');
    const [loading, setLoading] = useState(true);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await api.get(`/orders/${orderId}`);
                setOrder(response.data.order);
                setQrDataURL(JSON.stringify({ orderId: response.data.order._id, code: response.data.order.qrCode, timestamp: Date.now() }));
                if (response.data.order.feedback) setFeedbackSubmitted(true);
            } catch (error) {
                showToast('Buyurtma topilmadi', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();

        socket.on('orderUpdated', (updatedOrder) => { if (updatedOrder._id === orderId) setOrder(updatedOrder); });
        socket.on('orderReady', (o) => { if (o._id === orderId) { setOrder(o); setShowFeedbackModal(true); } });

        return () => { socket.off('orderUpdated'); socket.off('orderReady'); };
    }, [orderId]);

    const handleFeedback = async () => {
        try {
            await api.post('/feedback', { orderId, rating, comment });
            setFeedbackSubmitted(true);
            setShowFeedbackModal(false);
            showToast('Fikringiz uchun rahmat!', 'success');
        } catch (e) { showToast('Izoh yuborishda xatolik', 'error'); }
    };

    const getStatusInfo = (status) => {
        const info = {
            pending: { text: 'To\'lov kutilmoqda', color: 'text-warning', bg: 'bg-warning/10', icon: <FiClock /> },
            confirmed: { text: 'Tasdiqlandi', color: 'text-info', bg: 'bg-info/10', icon: <FiCheck /> },
            preparing: { text: 'Tayyorlanmoqda', color: 'text-primary', bg: 'bg-primary/10', icon: <div className="loading loading-spinner loading-xs"></div> },
            ready: { text: 'Tayyor!', color: 'text-success', bg: 'bg-success/20', icon: <FiCheck size={18} /> },
            completed: { text: 'Shunqoringiz topdi!', color: 'text-neutral', bg: 'bg-neutral/10', icon: <FiCheck /> }
        };
        return info[status] || { text: status, color: 'text-gray-500', bg: 'bg-gray-100', icon: null };
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-base-200"><LoadingSpinner /></div>;
    if (!order) return <div className="p-20 text-center font-black opacity-20 uppercase tracking-widest">Buyurtma topilmadi</div>;

    const statusInfo = getStatusInfo(order.status);

    return (
        <div className="min-h-screen bg-base-200 transition-colors duration-500">
            <nav className="navbar bg-base-100/80 border-b border-base-content/5 px-6 backdrop-blur-xl sticky top-0 z-50 h-20">
                <div className="flex-1">
                    <button onClick={() => navigate('/menu')} className="btn btn-ghost btn-circle shadow-inner bg-base-200/50"><span className="text-xl">🌭</span></button>
                    <h1 className="text-xl font-black uppercase tracking-tighter text-base-content ml-3">Buyurtma Tasdiqi</h1>
                </div>
                <button onClick={toggleTheme} className="btn btn-ghost btn-circle btn-sm bg-base-200/50">
                    {theme === 'dark' ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-indigo-600" />}
                </button>
            </nav>

            <div className="container mx-auto p-4 md:p-12 max-w-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="card bg-base-100 shadow-4xl rounded-[3.5rem] overflow-hidden border border-base-content/5 relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-accent"></div>

                    <div className="card-body text-center p-8 md:p-16">
                        <div className="w-20 h-20 bg-success/10 text-success rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-success/5 animate-bounce-slow">
                            <FiCheck size={40} />
                        </div>

                        <h1 className="text-4xl font-black uppercase tracking-tighter text-base-content mb-3 leading-none">Rahmat!</h1>
                        <p className="text-xs font-bold opacity-30 uppercase tracking-[0.3em] mb-8">Buyurtmangiz muvaffaqiyatli qabul qilindi</p>

                        <div className="badge badge-primary font-black px-6 py-4 mb-10 rounded-2xl text-white shadow-xl shadow-primary/20 scale-110">
                            # {order.dailyNumber}
                        </div>

                        <div className="bg-base-200/50 p-10 rounded-[3rem] inline-block mx-auto mb-10 border border-base-content/5 shadow-inner group transition-all duration-500 hover:bg-white hover:scale-105">
                            <div className="p-4 bg-white rounded-[2rem] shadow-2xl"><QRCodeSVG value={qrDataURL} size={200} /></div>
                            <p className="mt-6 text-[11px] font-black text-base-content opacity-40 uppercase tracking-[0.2em]">Kassaga ko'rsating</p>
                        </div>

                        <div className={`flex items-center justify-center gap-3 px-8 py-5 rounded-3xl ${statusInfo.bg} ${statusInfo.color} font-black uppercase text-sm tracking-widest mb-10 border border-current/10 shadow-lg shadow-current/5`}>
                            {statusInfo.icon} {statusInfo.text}
                        </div>

                        {(order.status === 'ready' || order.status === 'completed') && !feedbackSubmitted && (
                            <button onClick={() => setShowFeedbackModal(true)} className="btn btn-accent w-full h-16 rounded-[1.5rem] gap-3 font-black text-white shadow-xl shadow-accent/20 mb-10 text-lg group">
                                <FiMessageSquare size={20} className="group-hover:rotate-12 transition-transform" /> FIKRINGIZNI QOLDIRING
                            </button>
                        )}

                        <div className="text-left bg-base-200/50 p-10 rounded-[2.5rem] border border-base-content/5 mb-12">
                            <h3 className="font-black uppercase text-[10px] tracking-widest opacity-30 mb-6 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div> Buyurtma tafsilotlari
                            </h3>
                            <div className="space-y-4 mb-6">
                                {order.items.map((i, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm font-bold border-b border-base-content/5 pb-3">
                                        <span className="text-base-content opacity-80">{i.menuItem?.name || 'Mahsulot'} <span className="text-primary italic">x{i.quantity}</span></span>
                                        <span className="text-base-content">{(i.price * i.quantity).toLocaleString()} <small className="text-[10px] opacity-30 uppercase">so'm</small></span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-end pt-2">
                                <span className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">Yakuniy summa:</span>
                                <span className="text-3xl font-black text-primary tracking-tighter">{order.totalPrice.toLocaleString()} <small className="text-xs uppercase opacity-40">so'm</small></span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button onClick={() => navigate('/menu')} className="btn btn-primary h-14 rounded-2xl font-black uppercase shadow-xl shadow-primary/20 text-white tracking-tight">YANA BUYURTMA</button>
                            <button onClick={() => navigate('/')} className="btn btn-ghost h-14 rounded-2xl font-black uppercase opacity-40 tracking-tight">CHIQISH</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="modal modal-open backdrop-blur-xl bg-slate-900/60 transition-all duration-500">
                    <div className="modal-box bg-base-100 rounded-[3.5rem] p-12 max-w-sm border border-base-content/5 shadow-5xl animate-in zoom-in-95 duration-300">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 rotate-12 shadow-xl shadow-amber-500/20">
                                <FiStar size={32} fill="currentColor" />
                            </div>
                            <h3 className="text-2xl font-black text-base-content uppercase tracking-tight leading-none mb-2">Sizga yoqdimi?</h3>
                            <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Fikringiz biz uchun juda muhim</p>
                        </div>

                        <div className="flex justify-center gap-2 mb-10">
                            {[1, 2, 3, 4, 5].map(s => (
                                <button key={s} onClick={() => setRating(s)} className={`p-1.5 transition-all duration-300 hover:scale-125 ${rating >= s ? 'text-amber-400 drop-shadow-lg' : 'text-base-300 opacity-30'}`}>
                                    <FiStar size={36} fill={rating >= s ? "currentColor" : "none"} /></button>
                            ))}
                        </div>

                        <textarea
                            className="textarea textarea-bordered w-full h-32 rounded-[2rem] bg-base-200/50 border-0 focus:ring-2 focus:ring-primary font-bold text-sm px-6 py-4 mb-10"
                            placeholder="Taassurotlaringizni qoldiring..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        ></textarea>

                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setShowFeedbackModal(false)} className="btn btn-ghost rounded-2xl font-black uppercase text-[10px] tracking-widest">BEKOR</button>
                            <button onClick={handleFeedback} className="btn btn-primary rounded-2xl font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-primary/20">YUBORISH</button>
                        </div>
                    </div>
                </div>
            )}
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

    useEffect(() => {
        const verifyToken = async (token) => {
            try {
                const response = await api.get(`/auth/verify-magic-link/${token}`);
                login(response.data.token, response.data.user);
                showToast('Xush kelibsiz!', 'success');
                setTimeout(() => navigate('/menu'), 1000);
            } catch (error) {
                setStatus('error');
                showToast('Link yaroqsiz', 'error');
            }
        };
        const token = searchParams.get('token');
        if (token) verifyToken(token); else setStatus('error');
    }, [searchParams, login, navigate]);

    if (status === 'verifying') return <div className="min-h-screen bg-base-200 flex items-center justify-center p-8"><LoadingSpinner text="Tekshirilmoqda..." /></div>;

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-8">
            <div className="card bg-base-100 shadow-4xl p-16 text-center rounded-[3.5rem] border border-base-content/5 max-w-sm">
                <div className="w-20 h-20 bg-error/10 text-error rounded-[2rem] flex items-center justify-center mx-auto mb-8"><FiCheck size={40} className="rotate-45" /></div>
                <h2 className="text-3xl font-black text-base-content mb-3 uppercase tracking-tighter">XATOLIK!</h2>
                <p className="text-xs font-bold opacity-30 uppercase tracking-widest mb-10 leading-relaxed">Xavfsizlik linki yaroqsiz yoki muddati tugagan</p>
                <button onClick={() => navigate('/')} className="btn btn-primary w-full h-14 rounded-2xl font-black uppercase shadow-xl shadow-primary/20 text-white">BOSHLANG'ICH SAHIFA</button>
            </div>
        </div>
    );
}
