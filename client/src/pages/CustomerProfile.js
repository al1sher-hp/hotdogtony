import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { showToast } from '../components/shared/Toast';
import { FiClock, FiLogOut, FiSun, FiMoon, FiChevronLeft } from 'react-icons/fi';

export default function CustomerProfile({ theme, toggleTheme }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders/my/orders');
                setOrders(response.data.orders);
            } catch (error) {
                showToast('Buyurtmalarni yuklab bo\'lmadi', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
        showToast('Tizimdan chiqdingiz', 'info');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-base-200"><LoadingSpinner /></div>;

    return (
        <div className="min-h-screen bg-base-200 selection:bg-primary selection:text-white">
            <nav className="navbar bg-base-100/90 border-b border-base-300 sticky top-0 z-50 backdrop-blur px-6">
                <button onClick={() => navigate('/menu')} className="btn btn-ghost btn-sm px-4 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2">
                    <FiChevronLeft size={16} /> Menyu
                </button>
                <div className="flex-1 text-center font-black uppercase tracking-tighter text-xl">Profil</div>
                <div className="flex gap-2">
                    <button onClick={toggleTheme} className="btn btn-ghost btn-circle btn-sm">{theme === 'dark' ? <FiSun /> : <FiMoon />}</button>
                    <button onClick={handleLogout} className="btn btn-ghost btn-circle btn-sm text-error"><FiLogOut size={18} /></button>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* User Header Card */}
                <div className="card bg-base-100 shadow-2xl rounded-[3rem] mb-12 border border-base-300 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 h-32 w-full absolute top-0"></div>
                    <div className="card-body text-center pt-16 pb-12 relative z-10">
                        <div className="avatar placeholder mb-6 group">
                            <div className="bg-gradient-to-br from-primary to-secondary text-white rounded-[2.5rem] w-28 h-28 shadow-2xl group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                                <span className="text-5xl font-black italic">{user?.name?.charAt(0).toUpperCase()}</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tight text-base-content">{user?.name}</h2>
                        <p className="text-sm font-bold opacity-60 uppercase tracking-widest mt-1">{user?.email}</p>

                        <div className="flex justify-center gap-8 mt-8 border-t border-base-content/5 pt-8">
                            <div className="flex flex-col items-center">
                                <span className="text-3xl font-black text-primary">{orders.length}</span>
                                <span className="text-[10px] font-black opacity-60 uppercase tracking-widest mt-1">Jami Buyurtmalar</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders Grid */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 ml-4">
                        <div className="p-2 bg-base-content text-base-100 rounded-xl"><FiClock size={20} /></div>
                        Buyurtma Tarixi
                    </h2>

                    {orders.length === 0 ? (
                        <div className="p-20 text-center opacity-50 italic font-medium">Hali buyurtmalar mavjud emas...</div>
                    ) : (
                        <div className="grid gap-4">
                            {orders.map(order => (
                                <div key={order._id} className="card bg-base-100 border border-base-300 rounded-[2.5rem] p-8 hover:shadow-xl transition-all group">
                                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 text-primary font-black px-4 py-2 rounded-xl text-sm">#{order.dailyNumber}</div>
                                            <div className="text-[10px] font-black opacity-60 uppercase tracking-widest">{new Date(order.createdAt).toLocaleString('uz-UZ')}</div>
                                        </div>
                                        <div className="text-xl font-black text-primary tracking-tighter">{order.totalPrice.toLocaleString()} so'm</div>
                                    </div>

                                    <div className="grid gap-2 mb-4 bg-base-200/50 p-4 rounded-2xl">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm font-bold">
                                                <span className="opacity-70">{item.menuItem?.name || 'O\'chirilgan mahsulot'} x{item.quantity}</span>
                                                <span className="opacity-60">{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-base-content/5">
                                        <span className={`text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-1.5 ${order.status === 'completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                            {order.status}
                                        </span>
                                        <button onClick={() => navigate(`/order-confirmation/${order._id}`)} className="btn btn-ghost btn-sm text-primary rounded-xl font-black text-[10px] uppercase">Batafsil →</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
