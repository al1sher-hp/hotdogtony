import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { showToast } from '../components/shared/Toast';
import { FiUsers, FiShoppingBag, FiBox, FiMessageSquare, FiLogOut, FiTrash2, FiShield } from 'react-icons/fi';

export default function SuperAdminDashboard() {
    const [activeTab, setActiveTab] = useState('users');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { logout } = useAuth();

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
            // Handle different response structures
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

    const handleDelete = async (id) => {
        if (!window.confirm('Haqiqatdan ham o\'chirmoqchimisiz? Ushbu amal ortga qaytarilmaydi!')) return;

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
            showToast(error.response?.data?.error || 'O\'chirishda xatolik', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            {/* Navbar */}
            <div className="navbar bg-slate-800 border-b border-slate-700 px-6">
                <div className="flex-1">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <FiShield className="text-red-500" />
                        <span>SUPER ADMIN</span>
                        <span className="badge badge-error badge-sm text-[10px]">FULL ACCESS</span>
                    </h1>
                </div>
                <button onClick={logout} className="btn btn-ghost btn-sm gap-2">
                    <FiLogOut /> Chiqish
                </button>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {[
                        { id: 'users', label: 'Barcha Foydalanuvchilar', icon: <FiUsers /> },
                        { id: 'orders', label: 'Buyurtmalar', icon: <FiShoppingBag /> },
                        { id: 'menu', label: 'Menu', icon: <FiBox /> },
                        { id: 'ingredients', label: 'Zaxira', icon: <FiBox /> },
                        { id: 'feedback', label: 'Izohlar', icon: <FiMessageSquare /> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`btn btn-sm gap-2 rounded-lg ${activeTab === tab.id ? 'btn-error' : 'btn-ghost bg-slate-800'}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold capitalize">{activeTab} ro'yxati</h2>
                        <span className="text-sm text-slate-400">Jami: {data.length} ta</span>
                    </div>

                    {loading ? (
                        <div className="p-20 flex justify-center"><LoadingSpinner /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-slate-900/50">
                                    <tr>
                                        {activeTab === 'users' && <><th>Ism</th><th>Email</th><th>Rol</th></>}
                                        {activeTab === 'orders' && <><th>#</th><th>Xaridor</th><th>Summa</th><th>Holat</th></>}
                                        {activeTab === 'menu' && <><th>Nomi</th><th>Narxi</th><th>Kategoriya</th></>}
                                        {activeTab === 'ingredients' && <><th>Nomi</th><th>Miqdor</th><th>Birlik</th></>}
                                        {activeTab === 'feedback' && <><th>Reyting</th><th>Izoh</th><th>Buyurtma</th></>}
                                        <th className="text-right">Amallar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center py-10 text-slate-500">Ma'lumot topilmadi</td></tr>
                                    ) : (
                                        data.map((item) => (
                                            <tr key={item._id} className="hover:bg-slate-700/30 transition-colors">
                                                {activeTab === 'users' && (
                                                    <>
                                                        <td className="font-bold">{item.name}</td>
                                                        <td className="text-slate-400">{item.email}</td>
                                                        <td><span className={`badge badge-sm ${item.role === 'super-admin' ? 'badge-error' : item.role === 'boss' ? 'badge-warning' : 'badge-info'}`}>{item.role}</span></td>
                                                    </>
                                                )}
                                                {activeTab === 'orders' && (
                                                    <>
                                                        <td className="font-mono text-red-400">#{item.dailyNumber}</td>
                                                        <td>{item.customerName}</td>
                                                        <td className="font-bold">{item.totalPrice?.toLocaleString()} so'm</td>
                                                        <td><span className="badge badge-ghost badge-sm">{item.status}</span></td>
                                                    </>
                                                )}
                                                {activeTab === 'menu' && (
                                                    <>
                                                        <td className="font-bold">{item.name}</td>
                                                        <td>{item.price?.toLocaleString()} so'm</td>
                                                        <td>{item.category}</td>
                                                    </>
                                                )}
                                                {activeTab === 'ingredients' && (
                                                    <>
                                                        <td className="font-bold">{item.name}</td>
                                                        <td className={item.currentStock <= item.minStock ? 'text-red-400 font-bold' : ''}>{item.currentStock}</td>
                                                        <td>{item.unit}</td>
                                                    </>
                                                )}
                                                {activeTab === 'feedback' && (
                                                    <>
                                                        <td className="text-yellow-400 font-bold">⭐ {item.rating}</td>
                                                        <td className="max-w-xs truncate">{item.comment}</td>
                                                        <td>#{item.order?.dailyNumber}</td>
                                                    </>
                                                )}
                                                <td className="text-right">
                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        disabled={item.role === 'super-admin'} // O'zini o'zi o'chira olmaydi
                                                        className="btn btn-ghost btn-xs text-red-500 hover:bg-red-500/10"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="alert alert-warning bg-amber-900/20 border-amber-500/50 text-amber-200">
                        <div>
                            <h3 className="font-bold">Diqqat!</h3>
                            <div className="text-xs">Super Admin barcha ma'lumotlarni o'chirish huquqiga ega. Ehtiyot bo'ling.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
