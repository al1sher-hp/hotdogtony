import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { showToast } from '../components/shared/Toast';
import { FiUsers, FiShoppingBag, FiBox, FiMessageSquare, FiLogOut, FiTrash2, FiShield, FiPlus, FiX, FiEdit2, FiCheck } from 'react-icons/fi';

export default function SuperAdminDashboard() {
    const [activeTab, setActiveTab] = useState('users');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const { user: currentUser, logout } = useAuth();

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

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditItem(item);
            setFormData({
                name: item.name || '',
                email: item.email || '',
                password: '', // Parolni ko'rsatmaymiz
                role: item.role || 'employee'
            });
        } else {
            setEditItem(null);
            setFormData({ name: '', email: '', password: '', role: 'employee' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editItem) {
                // Update
                await api.patch(`/users/${editItem._id}`, formData);
                showToast('Ma\'lumotlar yangilandi!', 'success');
            } else {
                // Create
                await api.post('/users', formData);
                showToast('Foydalanuvchi yaratildi!', 'success');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Xatolik yuz berdi';
            showToast(errorMsg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, role) => {
        if (role === 'super-admin') {
            showToast('Super-adminni o\'chirib bo\'lmaydi!', 'error');
            return;
        }
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
            showToast('Muvaffaqiyatli o\'chirildi', 'success');
            fetchData();
        } catch (error) {
            showToast('O\'chirishda xatolik', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-red-500 selection:text-white">
            {/* Elegant Navbar */}
            <nav className="navbar bg-slate-900/40 border-b border-white/5 px-6 sticky top-0 z-40 backdrop-blur-xl">
                <div className="flex-1">
                    <div className="flex items-center gap-3 group cursor-default">
                        <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-700 rounded-xl shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
                            <FiShield className="text-white text-lg" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-black tracking-tight leading-none text-white">SUPER ADMIN</span>
                            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-red-500/80 mt-1">Master Control</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-xs font-bold text-white">{currentUser?.name}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{currentUser?.role}</span>
                    </div>
                    <button onClick={logout} className="btn btn-ghost btn-sm bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all gap-2 border-0">
                        <FiLogOut /> <span className="hidden sm:inline">Chiqish</span>
                    </button>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Modern Tab System */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                    <div className="inline-flex p-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm overflow-x-auto max-w-full">
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
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-red-500 text-white shadow-xl shadow-red-500/20 scale-105' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'users' && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="btn btn-error btn-md rounded-2xl gap-2 font-black shadow-xl shadow-red-500/20 w-full lg:w-auto"
                        >
                            <FiPlus className="text-lg" /> Foydalanuvchi Qo'shish
                        </button>
                    )}
                </div>

                {/* Data Container */}
                <div className="bg-slate-900/30 rounded-[2.5rem] border border-white/5 overflow-hidden backdrop-blur-2xl shadow-3xl">
                    <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-white/5 to-transparent gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-10 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
                            <div>
                                <h2 className="text-2xl font-black capitalize tracking-tight text-white">{activeTab} Boshqaruvi</h2>
                                <p className="text-xs text-slate-500 font-medium">Barcha ma'lumotlar real vaqtda yangilanadi</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-2 bg-slate-900 rounded-full border border-white/5 font-mono text-[10px] text-slate-400">
                                RECORDS_FOUND: {data.length}
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-32 flex justify-center"><LoadingSpinner /></div>
                    ) : (data.length === 0 ? (
                        <div className="p-32 text-center opacity-40">
                            <div className="text-6xl mb-4">📂</div>
                            <p className="font-bold italic text-slate-400">Hech qanday ma'lumot qoldirilmadi.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto p-4">
                            <table className="table w-full border-separate border-spacing-y-3">
                                <thead className="text-slate-500 text-[11px] font-black uppercase tracking-[0.15em]">
                                    <tr className="border-0">
                                        {activeTab === 'users' && <><th>Xodim / Email</th><th>Roli & Holati</th><th className="hidden md:table-cell">Ro'yxat. Sana</th></>}
                                        {activeTab === 'orders' && <><th>ID</th><th>Mijoz</th><th>Summa</th><th>Holat</th></>}
                                        {activeTab === 'menu' && <><th>Mahsulot</th><th>Narxi</th><th>Kategoriya</th></>}
                                        {activeTab === 'ingredients' && <><th>Ingredient</th><th>Qoldiq</th><th>Birlik</th></>}
                                        {activeTab === 'feedback' && <><th>Rating</th><th>Izoh</th><th className="hidden sm:table-cell">Buyurtma</th></>}
                                        <th className="text-right px-6">Amallar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item) => (
                                        <tr key={item._id} className="bg-white/5 hover:bg-white/[0.08] transition-all rounded-3xl group">
                                            {activeTab === 'users' && (
                                                <>
                                                    <td className="rounded-l-3xl">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-white group-hover:text-red-400 transition-colors uppercase">{item.name}</span>
                                                            <span className="text-[11px] text-slate-500 font-medium">{item.email}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className={`badge badge-sm rounded-lg font-black tracking-widest text-[9px] py-3 px-3 border-0 shadow-lg ${item.role === 'super-admin' ? 'bg-red-500/20 text-red-400 shadow-red-500/10' :
                                                            item.role === 'boss' ? 'bg-amber-500/20 text-amber-400 shadow-amber-500/10' :
                                                                item.role === 'employee' ? 'bg-blue-500/20 text-blue-400 shadow-blue-500/10' :
                                                                    'bg-slate-700/50 text-slate-400'
                                                            }`}>
                                                            {item.role.toUpperCase()}
                                                        </div>
                                                    </td>
                                                    <td className="text-xs text-slate-600 font-bold hidden md:table-cell">{new Date(item.createdAt).toLocaleDateString()}</td>
                                                </>
                                            )}
                                            {activeTab === 'orders' && (
                                                <>
                                                    <td className="font-black text-red-500 rounded-l-3xl">#{item.dailyNumber}</td>
                                                    <td className="font-bold">{item.customerName}</td>
                                                    <td className="font-black text-white">{item.totalPrice?.toLocaleString()} s.</td>
                                                    <td><div className="badge badge-outline badge-xs border-white/20 text-[9px] opacity-70 uppercase font-black">{item.status}</div></td>
                                                </>
                                            )}
                                            {activeTab === 'menu' && (
                                                <>
                                                    <td className="font-bold rounded-l-3xl">{item.name}</td>
                                                    <td className="text-emerald-400 font-bold">{item.price?.toLocaleString()} s.</td>
                                                    <td><span className="opacity-40 text-[10px] font-bold uppercase">{item.category}</span></td>
                                                </>
                                            )}
                                            {activeTab === 'ingredients' && (
                                                <>
                                                    <td className="font-bold rounded-l-3xl">{item.name}</td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${item.currentStock <= item.minStock ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></div>
                                                            <span className={item.currentStock <= item.minStock ? 'text-red-400 font-black' : 'font-bold'}>{item.currentStock}</span>
                                                        </div>
                                                    </td>
                                                    <td className="opacity-40 font-bold text-xs uppercase">{item.unit}</td>
                                                </>
                                            )}
                                            {activeTab === 'feedback' && (
                                                <>
                                                    <td className="rounded-l-3xl"><div className="flex text-amber-400 font-black text-sm">⭐ {item.rating}</div></td>
                                                    <td className="max-w-xs truncate text-[11px] italic text-slate-400">{item.comment}</td>
                                                    <td className="opacity-40 text-[10px] font-black hidden sm:table-cell">ORD_#{item.order?.dailyNumber || '???'}</td>
                                                </>
                                            )}
                                            <td className="text-right rounded-r-3xl px-6">
                                                <div className="flex justify-end gap-1 opacity-40 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                                                    {activeTab === 'users' && (
                                                        <button
                                                            onClick={() => handleOpenModal(item)}
                                                            className="btn btn-ghost btn-xs text-blue-400 hover:bg-blue-500/10 rounded-lg p-1"
                                                        >
                                                            <FiEdit2 />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(item._id, item.role)}
                                                        disabled={item.role === 'super-admin' && item._id === currentUser.id}
                                                        className="btn btn-ghost btn-xs text-red-500 hover:bg-red-500/10 rounded-lg p-1"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            </div>

            {/* Premium Create/Edit Modal */}
            {showModal && (
                <div className="modal modal-open bg-slate-950/90 backdrop-blur-2xl transition-all duration-300">
                    <div className="modal-box bg-slate-900 border border-white/10 rounded-[3rem] p-10 shadow-4xl overflow-visible max-w-md relative">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-[2rem] shadow-2xl flex items-center justify-center border-4 border-slate-900 rotate-12 group hover:rotate-0 transition-transform">
                            <FiUsers className="text-white text-4xl" />
                        </div>

                        <div className="mt-8 text-center mb-8">
                            <h3 className="text-3xl font-black tracking-tighter text-white uppercase">{editItem ? 'Tahrirlash' : 'Yangi Xodim'}</h3>
                            <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-widest">{editItem ? "Mavjud ma'lumotlarni o'zgartirish" : "Tizimga yangi ro'yxat qo'shish"}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-500 ml-2 tracking-widest">To'liq ism-sharif</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        className="input bg-white/5 border-white/5 focus:border-red-500/50 focus:bg-white/10 rounded-2xl w-full h-14 pl-5 font-bold transition-all outline-none"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ali Valiyev"
                                        required
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity"><FiCheck className="text-red-500" /></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-500 ml-2 tracking-widest">Elektron Pochta</label>
                                <input
                                    type="email"
                                    className="input bg-white/5 border-white/5 focus:border-red-500/50 focus:bg-white/10 rounded-2xl w-full h-14 pl-5 font-bold transition-all outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="example@mail.uz"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-500 ml-2 tracking-widest">Yangi Maxfiy Parol {editItem && "(ixtiyoriy)"}</label>
                                <input
                                    type="password"
                                    className="input bg-white/5 border-white/5 focus:border-red-500/50 focus:bg-white/10 rounded-2xl w-full h-14 pl-5 font-bold transition-all outline-none"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    required={!editItem}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-500 ml-2 tracking-widest">Vazifasi & Huquqlari</label>
                                <select
                                    className="select bg-white/5 border-white/5 focus:border-red-500/50 rounded-2xl w-full h-14 pl-5 font-bold transition-all outline-none appearance-none"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="employee" className="bg-slate-900">ODDIY HODIM (STAFF)</option>
                                    <option value="boss" className="bg-slate-900">BOSHLIQ (OWNER)</option>
                                    <option value="customer" className="bg-slate-900">MIJOZ (CLIENT)</option>
                                    <option value="super-admin" className="bg-slate-900">S.ADMIN (ROOT)</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn flex-1 bg-white/5 hover:bg-white/10 border-0 text-slate-400 h-14 rounded-2xl font-black transition-all"
                                >
                                    BEKOR
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn flex-[2] btn-error h-14 rounded-2xl shadow-2xl shadow-red-500/30 font-black border-0"
                                >
                                    {submitting ? <span className="loading loading-spinner"></span> : (editItem ? 'YANGILASH' : 'TASDIQLASH')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
