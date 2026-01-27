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
import { FiShoppingCart, FiUser, FiPlus, FiMinus, FiTrash2, FiLogOut, FiMessageSquare, FiStar, FiCheck, FiSun, FiMoon } from 'react-icons/fi';
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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[140px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[140px]"></div>

            <div className="absolute top-6 right-6">
                <button onClick={toggleTheme} className="btn btn-ghost btn-circle text-white/40 hover:text-white transition-colors bg-white/5 border-0 rounded-2xl w-14 h-14">
                    {theme === 'dark' ? <FiSun size={24} /> : <FiMoon size={24} />}
                </button>
            </div>

            <div className="glass-card bg-white/5 border border-white/5 backdrop-blur-2xl p-8 md:p-14 max-w-md w-full animate-in fade-in zoom-in duration-700 rounded-[3.5rem] shadow-4xl">
                <div className="text-center mb-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-12 transition-all duration-500">
                        <span className="text-6xl">🌭</span>
                    </div>
                    <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">Hotdog Tony</h2>
                    <p className="text-white/40 font-bold tracking-widest text-[10px] uppercase">Premium Street Food</p>
                </div>

                {authMode === 'guest' && (
                    <div className="space-y-4">
                        <input type="text" placeholder="Ismingizni kiriting" value={name} onChange={(e) => setName(e.target.value)} className="input w-full h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold px-6" />
                        <button onClick={handleGuestOrder} className="btn btn-primary w-full h-14 rounded-2xl font-black uppercase shadow-xl shadow-primary/20">Buyurtma Berish</button>
                        <div className="divider text-white/10 text-[10px] font-black uppercase tracking-widest leading-none">yoki</div>
                        <div className="flex gap-3">
                            <button onClick={() => setAuthMode('login')} className="btn btn-ghost flex-1 text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase">Kirish</button>
                            <button onClick={() => setAuthMode('register')} className="btn btn-ghost flex-1 text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase">Ro'yxatdan o'tish</button>
                        </div>
                    </div>
                )}

                {authMode === 'login' && (
                    <div className="space-y-4">
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input w-full h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold px-6" />
                        <input type="password" placeholder="Parol" value={password} onChange={(e) => setPassword(e.target.value)} className="input w-full h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold px-6" />
                        <button onClick={handleLogin} disabled={loading} className="btn btn-primary w-full h-14 rounded-2xl font-black uppercase shadow-xl shadow-primary/20">{loading ? '...' : 'Kirish'}</button>
                        <button onClick={() => setAuthMode('guest')} className="btn btn-link btn-xs text-white/40 block mx-auto mt-2">Orqaga</button>
                    </div>
                )}

                {authMode === 'register' && (
                    <div className="space-y-4">
                        <input type="text" placeholder="To'liq ism" value={name} onChange={(e) => setName(e.target.value)} className="input w-full h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold px-6" />
                        <input type="email" placeholder="Email manzilingiz" value={email} onChange={(e) => setEmail(e.target.value)} className="input w-full h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold px-6" />
                        <input type="password" placeholder="Parol" value={password} onChange={(e) => setPassword(e.target.value)} className="input w-full h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold px-6" />
                        <button onClick={handleRegister} disabled={loading} className="btn btn-primary w-full h-14 rounded-2xl font-black uppercase shadow-xl shadow-primary/20">{loading ? '...' : 'Ro\'yxatdan o\'tish'}</button>
                        <button onClick={() => setAuthMode('guest')} className="btn btn-link btn-xs text-white/40 block mx-auto mt-2">Orqaga</button>
                    </div>
                )}
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

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-base-200"><LoadingSpinner /></div>;

    return (
        <div className="min-h-screen bg-base-200">
            <nav className="navbar bg-base-100/90 border-b border-base-300 sticky top-0 z-50 backdrop-blur px-6">
                <div className="flex-1 font-black uppercase tracking-tighter text-xl">🌭 Hotdog Tony</div>
                <div className="flex gap-2">
                    <button onClick={toggleTheme} className="btn btn-ghost btn-circle btn-sm">{theme === 'dark' ? <FiSun /> : <FiMoon />}</button>
                    <button onClick={() => navigate('/cart')} className="btn btn-ghost relative btn-circle"><FiShoppingCart />{cartCount > 0 && <span className="badge badge-primary badge-sm absolute top-0 right-0">{cartCount}</span>}</button>
                    {user && <button onClick={() => navigate('/profile')} className="btn btn-ghost btn-circle"><FiUser /></button>}
                </div>
            </nav>

            <div className="bg-base-100 p-4 sticky top-[64px] z-40 border-b border-base-300 overflow-x-auto">
                <div className="flex gap-2 min-w-max justify-center">
                    {categories.map(cat => (
                        <button key={cat.value} onClick={() => setSelectedCategory(cat.value)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${selectedCategory === cat.value ? 'bg-primary text-white shadow-lg' : 'bg-base-200 opacity-60'}`}>{cat.label}</button>
                    ))}
                </div>
            </div>

            <main className="container mx-auto p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredItems.map(item => (
                    <div key={item._id} className="card bg-base-100 border border-base-300 hover:shadow-2xl transition-all rounded-[2.5rem] overflow-hidden group">
                        <figure className="h-48 overflow-hidden"><img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" /></figure>
                        <div className="card-body p-6">
                            <h2 className="card-title font-black uppercase text-sm tracking-tight">{item.name}</h2>
                            <p className="text-xs opacity-60 line-clamp-2 h-8">{item.description}</p>
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-xl font-black text-primary">{(item.price).toLocaleString()} <small className="text-[10px] opacity-40">so'm</small></span>
                                <button onClick={() => addToCart(item)} className="btn btn-primary btn-sm rounded-xl px-4 font-black"><FiPlus /></button>
                            </div>
                        </div>
                    </div>
                ))}
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
    const { user } = useAuth();

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
    };

    const totalPrice = cart.reduce((s, i) => s + (i.price * i.quantity), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;
        setLoading(true);
        try {
            const res = await api.post('/orders', {
                customerName,
                items: cart.map(i => ({ menuItem: i._id, quantity: i.quantity, price: i.price })),
                totalPrice
            });
            localStorage.removeItem('cart');
            navigate(`/order-confirmation/${res.data.order._id}`);
        } catch (e) {
            showToast('Xatolik yuz berdi', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-200">
            <nav className="navbar bg-base-100 border-b border-base-300 px-6 sticky top-0 z-50">
                <button onClick={() => navigate('/menu')} className="btn btn-ghost font-black uppercase text-xs tracking-widest">← Orqaga</button>
                <div className="flex-1 text-center font-black uppercase tracking-tighter text-xl">Sa'vatcha</div>
                <button onClick={toggleTheme} className="btn btn-ghost btn-circle btn-sm">{theme === 'dark' ? <FiSun /> : <FiMoon />}</button>
            </nav>

            <div className="container mx-auto p-4 lg:p-12 max-w-6xl grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-6">Buyurtmangiz</h2>
                    {cart.length === 0 ? <p className="opacity-40 font-bold uppercase tracking-widest">Savat hali bo'sh...</p> : cart.map(item => (
                        <div key={item._id} className="card bg-base-100 p-4 border border-base-300 rounded-[2rem] flex flex-row items-center gap-4">
                            <img src={item.image} alt="" className="w-16 h-16 rounded-2xl object-cover" />
                            <div className="flex-1">
                                <h3 className="font-black text-xs uppercase tracking-tight">{item.name}</h3>
                                <p className="text-primary font-black">{(item.price).toLocaleString()} so'm</p>
                            </div>
                            <div className="flex items-center gap-3 bg-base-200 p-1 rounded-full">
                                <button onClick={() => updateQuantity(item._id, -1)} className="btn btn-ghost btn-xs btn-circle bg-base-100"><FiMinus /></button>
                                <span className="font-black text-xs w-4 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item._id, 1)} className="btn btn-ghost btn-xs btn-circle bg-base-100"><FiPlus /></button>
                            </div>
                            <button onClick={() => removeItem(item._id)} className="btn btn-ghost btn-circle text-error"><FiTrash2 /></button>
                        </div>
                    ))}
                </div>

                <div className="card bg-base-100 shadow-2xl p-8 rounded-[3rem] h-fit sticky top-24 border border-base-300">
                    <div className="flex justify-between items-center mb-8 border-b border-dashed border-base-300 pb-4">
                        <span className="font-black opacity-40 uppercase text-[10px] tracking-widest">Jami Summa:</span>
                        <span className="text-3xl font-black text-primary tracking-tighter">{totalPrice.toLocaleString()} so'm</span>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <label className="text-[10px] font-black uppercase opacity-40 block mb-1 ml-2">Qabul qiluvchi</label>
                        <input type="text" className="input input-bordered w-full h-14 rounded-2xl font-bold bg-base-200 border-0" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                        <button type="submit" disabled={loading || cart.length === 0} className="btn btn-primary w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 uppercase tracking-tight mt-4">{loading ? '...' : 'Tasdiqlash'}</button>
                    </form>
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
            showToast('Rahmat!', 'success');
        } catch (e) { showToast('Xatolik', 'error'); }
    };

    if (loading) return <LoadingSpinner />;
    if (!order) return <div className="p-20 text-center font-black opacity-20 uppercase">Buyurtma topilmadi</div>;

    return (
        <div className="min-h-screen bg-base-200">
            <nav className="navbar bg-base-100 border-b border-base-300 px-6 backdrop-blur sticky top-0 z-50">
                <div className="flex-1 font-black uppercase tracking-tighter text-xl ml-2">Buyurtma Tasdiqi</div>
                <button onClick={toggleTheme} className="btn btn-ghost btn-circle btn-sm">{theme === 'dark' ? <FiSun /> : <FiMoon />}</button>
            </nav>

            <div className="container mx-auto p-4 md:p-12 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="card bg-base-100 shadow-4xl rounded-[3rem] overflow-hidden border border-base-300">
                    <div className="card-body text-center p-8 md:p-14">
                        <div className="w-16 h-16 bg-success/10 text-success rounded-3xl flex items-center justify-center mx-auto mb-6"><FiCheck size={32} /></div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Qabul Qilindi!</h1>
                        <div className="badge badge-primary font-black px-4 py-3 mb-6 rounded-xl">BUYURTMA #{order.dailyNumber}</div>

                        <div className="bg-base-200 p-8 rounded-[2.5rem] inline-block mx-auto mb-8 border border-base-300 shadow-inner">
                            <div className="bg-white p-3 rounded-2xl shadow-sm"><QRCodeSVG value={qrDataURL} size={200} /></div>
                            <p className="mt-4 text-[10px] font-black text-base-content/40 uppercase tracking-widest">Kassaga ko'rsating</p>
                        </div>

                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-8 italic font-bold text-sm text-primary">
                            {order.status === 'pending' && "To'lov uchun kassaga boring"}
                            {order.status === 'preparing' && "Oshpazlarimiz tayyorlashmoqda..."}
                            {order.status === 'ready' && "Buyurtmangiz tayyor! Yakka oling!"}
                        </div>

                        {(order.status === 'ready' || order.status === 'completed') && !feedbackSubmitted && (
                            <button onClick={() => setShowFeedbackModal(true)} className="btn btn-accent w-full rounded-2xl gap-2 font-black mb-6"><FiMessageSquare /> FIKR QOLDIRISH</button>
                        )}

                        <div className="text-left bg-base-200 p-6 rounded-[2rem] border border-base-300">
                            {order.items.map((i, idx) => (
                                <div key={idx} className="flex justify-between py-2 border-b border-base-content/5 text-sm font-bold opacity-80">
                                    <span>{i.menuItem?.name || 'Mahsulot'} x{i.quantity}</span>
                                    <span>{(i.price * i.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="flex justify-between pt-4 font-black text-xl text-primary"><span>JAMI:</span><span>{order.totalPrice.toLocaleString()} so'm</span></div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-8">
                            <button onClick={() => navigate('/menu')} className="btn btn-primary lg:btn-lg flex-1 rounded-2xl font-black opacity-90">YANA BUYURTMA</button>
                            <button onClick={() => navigate('/')} className="btn btn-ghost lg:btn-lg flex-1 rounded-2xl opacity-40 font-black">XAYR</button>
                        </div>
                    </div>
                </div>
            </div>

            {showFeedbackModal && (
                <div className="modal modal-open backdrop-blur-sm">
                    <div className="modal-box rounded-[3rem] p-10 max-w-sm border border-base-300">
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-6 shadow-lg shadow-amber-500/10"><FiStar size={28} fill="currentColor" /></div>
                            <h3 className="text-xl font-black tracking-tight uppercase">Sizga yoqdimi?</h3>
                        </div>
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map(s => <button key={s} onClick={() => setRating(s)} className={`p-1 transition-all ${rating >= s ? 'text-amber-400 scale-110' : 'text-base-300 opacity-30'}`}><FiStar size={32} fill={rating >= s ? "currentColor" : "none"} /></button>)}
                        </div>
                        <textarea className="textarea textarea-bordered w-full h-24 rounded-2xl bg-base-200 border-0 focus:ring-2 focus:ring-primary/40 font-bold mb-6" placeholder="Izohingizni yozib qoldiring..." value={comment} onChange={e => setComment(e.target.value)}></textarea>
                        <div className="flex gap-3">
                            <button onClick={() => setShowFeedbackModal(false)} className="btn btn-ghost flex-1 rounded-2xl">BEKOR</button>
                            <button onClick={handleFeedback} className="btn btn-primary flex-1 rounded-2xl font-black shadow-lg shadow-primary/20">YUBORISH</button>
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

    if (status === 'verifying') return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner text="Tekshirilmoqda..." /></div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="text-center p-8 bg-base-100 rounded-[2rem] shadow-xl">
                <h2 className="text-2xl font-black text-error mb-4">XATOLIK!</h2>
                <button onClick={() => navigate('/')} className="btn btn-primary rounded-xl">BOSHLANG'ICH SAHIFA</button>
            </div>
        </div>
    );
}
