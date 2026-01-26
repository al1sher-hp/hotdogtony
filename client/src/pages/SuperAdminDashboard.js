import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { showToast } from '../components/shared/Toast';
import { FiUsers, FiShoppingBag, FiBox, FiMessageSquare, FiLogOut, FiTrash2, FiShield, FiPlus, FiX } from 'react-icons/fi';

export default function SuperAdminDashboard() {
    const [activeTab, setActiveTab] = useState('users');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { logout } = useAuth();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'employee'
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let endpoint = '';
            switch (activeTab) {
                case 'users': endpoint = '/users'; break;
                case 'orders': endpoint = '/orders'; break;
                case 'menu': endpoint = '/menu'; break;
                case 'ingredients': endpoint = '/ingredients'; break;
                case 'feedback': endpoint = '/feedback'; break;
                default: endpoint = '/users';
            }
            const res = await api.get(endpoint);
            const result = res.data.users || res.data.orders || res.data.menuItems || res.data.ingredients || res.data.feedbacks || [];
            setData(result);
        } catch (error) {
            showToast('Ma\'lumotlarni yuklab bo\'lmadi', 'error');
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/users', formData);
            showToast('Foydalanuvchi yaratildi!', 'success');
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', role: 'employee' });
            fetchData();
        } catch (error) {
            // Serverdan kelayotgan aniq xato xabarini ko'rsatish
            const errorMsg = error.response?.data?.error || 'Xatolik yuz berdi';
            showToast(errorMsg, 'error');
            console.error('Create error:', error.response?.data);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Haqiqatdan ham o\'chirmoqchimisiz?')) return;
        try {
            let endpoint = '';
            switch (activeTab) {
                case 'users': endpoint = `/users/${id}`; break;
                case 'orders': endpoint = `/orders/${id}`; break;
                case 'menu': endpoint = `/menu/${id}`; break;
                case 'ingredients': endpoint = `/ingredients/${id}`; break;
                case 'feedback': endpoint = `/feedback/${id}`; break;
                default: return;
            }
            await api.delete(endpoint);
            showToast('O\'chirildi', 'success');
            fetchData();
        } catch (error) {
            showToast('O\'chirishda xatolik', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            {/* Navbar */}
            <div className="navbar bg-slate-900 border-b border-white/10 px-6 sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
                <div className="flex-1">
                    <h1 className="text-xl font-black flex items-center gap-3 tracking-tighter">
                        <div className="p-2 bg-red-600 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                            <FiShield className="text-white" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-white">SUPER ADMIN</span>
                            <span className="text-[10px] text-red-500 font-bold opacity-70">ROOT ACCESS</span>
                        </div>
                    </h1>
                </div>
                <button onClick={logout} className="btn btn-ghost btn-sm gap-2 text-slate-400 hover:text-white transition-colors">
                    <FiLogOut /> Chiqish
                </button>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Statistics / Quick Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'users', label: 'Foydalanuvchilar', icon: <FiUsers /> },
                            { id: 'orders', label: 'Buyurtmalar', icon: <FiShoppingBag /> },
                            { id: 'menu', label: 'Menu', icon: <FiBox /> },
                            { id: 'ingredients', label: 'Zaxira', icon: <FiBox /> },
                            { id: 'feedback', label: 'Izohlar', icon: <FiMessageSquare /> },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`btn btn-sm gap-2 rounded-xl transition-all ${activeTab === tab.id ? 'btn-error shadow-lg shadow-red-900/20' : 'btn-ghost bg-white/5 border-white/5 hover:bg-white/10'}`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'users' && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn btn-error btn-sm rounded-xl gap-2 shadow-lg shadow-red-900/20"
                        >
                            <FiPlus /> Yangi Foydalanuvchi Uzatish
                        </button>
                    )}
                </div>

                {/* Main Table */}
                <div className="bg-slate-900/50 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-sm shadow-2xl">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-red-600 rounded-full"></div>
                            <h2 className="text-xl font-bold capitalize tracking-tight">{activeTab} ro'yxati</h2>
                        </div>
                        <span className="badge badge-ghost border-white/10 font-mono text-xs opacity-50">#TOTAL_{data.length}</span>
                    </div>

                    {loading ? (
                        <div className="p-24 flex justify-center"><LoadingSpinner /></div>
                    ) : (data.length === 0 ? (
                        <div className="p-20 text-center text-slate-500 font-medium italic">Hech qanday ma'lumot topilmadi...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table w-full border-separate border-spacing-y-2 px-4 pb-4">
                                <thead className="text-slate-500 text-[10px] uppercase tracking-widest">
                                    <tr>
                                        {activeTab === 'users' && <><th>Ism / Email</th><th>Rol</th><th>Sana</th></>}
                                        {activeTab === 'orders' && <><th>Order ID</th><th>Xaridor</th><th>Summa</th><th>Holat</th></>}
                                        {activeTab === 'menu' && <><th>Mahsulot</th><th>Narxi</th><th>Kategoriya</th></>}
                                        {activeTab === 'ingredients' && <><th>Ingredient</th><th>Zaxira qoldig'i</th><th>Birlik</th></>}
                                        {activeTab === 'feedback' && <><th>Reyting</th><th>Izoh</th><th>ID</th></>}
                                        <th className="text-right">Boshqaruv</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item) => (
                                        <tr key={item._id} className="bg-white/5 hover:bg-white/10 transition-all rounded-2xl group">
                                            {activeTab === 'users' && (
                                                <>
                                                    <td>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-white">{item.name}</span>
                                                            <span className="text-xs text-slate-500">{item.email}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge badge-sm rounded-lg font-bold border-0 ${item.role === 'super-admin' ? 'bg-red-500/20 text-red-400' :
                                                                item.role === 'boss' ? 'bg-amber-500/20 text-amber-400' :
                                                                    item.role === 'employee' ? 'bg-blue-500/20 text-blue-400' :
                                                                        'bg-slate-700/50 text-slate-400'
                                                            }`}>
                                                            {item.role.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                                                </>
                                            )}
                                            {activeTab === 'orders' && (
                                                <>
                                                    <td className="font-black text-red-500">#{item.dailyNumber}</td>
                                                    <td className="font-medium">{item.customerName}</td>
                                                    <td className="font-black text-white">{item.totalPrice?.toLocaleString()} so'm</td>
                                                    <td><div className="badge badge-outline badge-xs text-[10px] opacity-70 uppercase font-bold">{item.status}</div></td>
                                                </>
                                            )}
                                            {activeTab === 'menu' && (
                                                <>
                                                    <td className="font-bold">{item.name}</td>
                                                    <td className="text-emerald-400 font-bold">{item.price?.toLocaleString()} s.</td>
                                                    <td><span className="opacity-50 text-xs">{item.category}</span></td>
                                                </>
                                            )}
                                            {activeTab === 'ingredients' && (
                                                <>
                                                    <td className="font-bold">{item.name}</td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${item.currentStock <= item.minStock ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                                                            <span className={item.currentStock <= item.minStock ? 'text-red-400 font-bold' : ''}>{item.currentStock}</span>
                                                        </div>
                                                    </td>
                                                    <td className="opacity-50">{item.unit}</td>
                                                </>
                                            )}
                                            {activeTab === 'feedback' && (
                                                <>
                                                    <td><div className="flex text-amber-400 font-bold">⭐ {item.rating}</div></td>
                                                    <td className="max-w-xs truncate text-xs italic text-slate-400">"{item.comment}"</td>
                                                    <td className="opacity-50 text-[10px]">#{item.order?.dailyNumber || 'N/A'}</td>
                                                </>
                                            )}
                                            <td className="text-right">
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    disabled={item.role === 'super-admin'}
                                                    className="btn btn-ghost btn-xs text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="modal modal-open bg-slate-950/80 backdrop-blur-xl">
                    <div className="modal-box bg-slate-900 border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-visible max-w-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black tracking-tighter">YANGI FOYDALANUVCHI</h3>
                            <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-circle btn-sm"><FiX /></button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="form-control">
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">To'liq ism</label>
                                <input
                                    type="text"
                                    className="input bg-white/5 border-white/10 focus:border-red-500 rounded-xl w-full"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Masalan: Ali Valiyev"
                                    required
                                />
                            </div>
                            <div className="form-control">
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">Email manzili</label>
                                <input
                                    type="email"
                                    className="input bg-white/5 border-white/10 focus:border-red-500 rounded-xl w-full"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="ali@hotdog.uz"
                                    required
                                />
                            </div>
                            <div className="form-control">
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">Parol</label>
                                <input
                                    type="password"
                                    className="input bg-white/5 border-white/10 focus:border-red-500 rounded-xl w-full"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="form-control">
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">Vazifasi (Rol)</label>
                                <select
                                    className="select bg-white/5 border-white/10 focus:border-red-500 rounded-xl w-full"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="employee" className="bg-slate-900">Hodim (Staff)</option>
                                    <option value="boss" className="bg-slate-900">Boshliq (Boss)</option>
                                    <option value="customer" className="bg-slate-900">Mijoz (Customer)</option>
                                    <option value="super-admin" className="bg-slate-900">Super Admin</option>
                                </select>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn btn-error w-full rounded-xl shadow-lg shadow-red-900/20 font-bold"
                                >
                                    {submitting ? <span className="loading loading-spinner"></span> : 'YARATISH VA TASDIQLASH'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
