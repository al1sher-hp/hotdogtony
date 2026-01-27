import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { showToast } from '../components/shared/Toast';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { FiTrendingUp, FiUsers, FiShoppingBag, FiBox, FiMessageSquare, FiLogOut, FiDownload, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

export default function BossDashboard() {
    const [stats, setStats] = useState(null);
    const [period, setPeriod] = useState('daily');
    const [activeTab, setActiveTab] = useState('stats');
    const [loading, setLoading] = useState(true);
    const { logout } = useAuth();

    // Data for tabs
    const [employees, setEmployees] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [feedback, setFeedback] = useState([]);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [editItem, setEditItem] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'stats') {
                const res = await api.get(`/reports/stats?period=${period}`);
                setStats(res.data);
            } else if (activeTab === 'menu') {
                const res = await api.get('/menu');
                setMenuItems(res.data.menuItems);
            } else if (activeTab === 'employees') {
                const res = await api.get('/users?role=employee');
                setEmployees(res.data.users);
            } else if (activeTab === 'feedback') {
                const res = await api.get('/feedback');
                setFeedback(res.data.feedbacks);
            }
        } catch (error) {
            showToast('Ma\'lumotlarni yuklashda xatolik', 'error');
        } finally {
            setLoading(false);
        }
    }, [activeTab, period]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const exportToExcel = async () => {
        try {
            const response = await api.get(`/reports/export?period=${period}&type=orders`);
            const ws = XLSX.utils.json_to_sheet(response.data.exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Orders');
            XLSX.writeFile(wb, `orders-${period}-${Date.now()}.xlsx`);
            showToast('Excel yuklab olindi', 'success');
        } catch (error) {
            showToast('Export xato', 'error');
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm('Haqiqatdan ham o\'chirmoqchimisiz?')) return;
        try {
            await api.delete(`/${type}/${id}`);
            showToast('Muvaffaqiyatli o\'chirildi', 'success');
            fetchData();
        } catch (error) {
            showToast('O\'chirishda xatolik', 'error');
        }
    };

    if (loading && activeTab === 'stats' && !stats) return <LoadingSpinner />;

    const chartData = {
        labels: stats?.hourlyOrders?.map((_, i) => `${i}:00`) || [],
        datasets: [{
            label: 'Buyurtmalar',
            data: stats?.hourlyOrders || [],
            backgroundColor: 'rgba(99, 102, 241, 0.5)',
            borderColor: 'rgb(99, 102, 241)',
            borderWidth: 2,
            borderRadius: 5
        }]
    };

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Sidebar-style Nav */}
            <div className="navbar bg-white border-b border-gray-100 px-6 sticky top-0 z-50">
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="p-2 bg-indigo-600 rounded-lg text-white">🌭</span>
                        Boshliq Paneli
                    </h1>
                </div>
                <div className="flex-none gap-4">
                    {activeTab === 'stats' && (
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="select select-bordered select-sm rounded-lg font-medium"
                        >
                            <option value="daily">Bugun</option>
                            <option value="weekly">Hafta</option>
                            <option value="monthly">Oy</option>
                        </select>
                    )}
                    <button onClick={logout} className="btn btn-ghost btn-sm text-gray-500 rounded-lg">
                        <FiLogOut /> Chiqish
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Dashboard Tabs */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                    {[
                        { id: 'stats', label: 'Statistika', icon: <FiTrendingUp /> },
                        { id: 'menu', label: 'Menu', icon: <FiShoppingBag /> },
                        { id: 'employees', label: 'Xodimlar', icon: <FiUsers /> },
                        { id: 'feedback', label: 'Feedback', icon: <FiMessageSquare /> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 translate-y-[-2px]'
                                : 'bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><LoadingSpinner /></div>
                ) : (
                    <div className="animate-fade-in">
                        {activeTab === 'stats' && (
                            <div className="space-y-8">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Buyurtmalar', val: stats?.stats?.totalOrders, color: 'indigo' },
                                        { label: 'Tushum', val: `${(stats?.stats?.totalRevenue || 0).toLocaleString()} s.`, color: 'emerald' },
                                        { label: 'O\'rtacha Chek', val: `${Math.round(stats?.stats?.averageOrderValue || 0).toLocaleString()} s.`, color: 'amber' },
                                        { label: 'Reyting', val: `⭐ ${stats?.stats?.averageRating || 0}`, color: 'rose' }
                                    ].map((s, i) => (
                                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{s.label}</p>
                                            <p className="text-3xl font-bold text-gray-800 mt-1">{s.val}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Main Stats */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-center mb-8">
                                            <h3 className="font-bold text-xl text-gray-800">Sotuv Grafigi</h3>
                                            <button onClick={exportToExcel} className="btn btn-sm btn-ghost text-indigo-600 gap-2">
                                                <FiDownload /> Excel
                                            </button>
                                        </div>
                                        <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                                    </div>
                                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                        <h3 className="font-bold text-xl text-gray-800 mb-6">Top Mahsulotlar</h3>
                                        <div className="space-y-4">
                                            {stats?.popularItems?.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                                                    <span className="font-medium text-gray-700">{item.name}</span>
                                                    <span className="badge badge-indigo border-0 font-bold">{item.count} dona</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'menu' && (
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="font-bold text-2xl">Menu Boshqaruvi</h3>
                                    <button onClick={() => { setModalType('menu'); setEditItem(null); setShowModal(true); }} className="btn btn-primary rounded-xl gap-2"><FiPlus /> Qo'shish</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {menuItems.map(item => (
                                        <div key={item._id} className="card bg-gray-50/50 border border-gray-100 hover:shadow-lg transition-all rounded-2xl overflow-hidden">
                                            <img src={item.image} alt={item.name} className="h-40 w-full object-cover" />
                                            <div className="p-4">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-bold">{item.name}</h4>
                                                    <span className="text-indigo-600 font-bold">{item.price.toLocaleString()} s.</span>
                                                </div>
                                                <div className="flex gap-2 mt-4">
                                                    <button onClick={() => { setEditItem(item); setModalType('menu'); setShowModal(true); }} className="btn btn-xs btn-ghost text-indigo-600">Tahrirlash</button>
                                                    <button onClick={() => handleDelete('menu', item._id)} className="btn btn-xs btn-ghost text-red-500">O'chirish</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'employees' && (
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="font-bold text-2xl">Xodimlar</h3>
                                    <button onClick={() => { setModalType('employee'); setEditItem(null); setShowModal(true); }} className="btn btn-primary rounded-xl gap-2"><FiPlus /> Qo'shish</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead>
                                            <tr><th>Ism</th><th>Email</th><th>Amallar</th></tr>
                                        </thead>
                                        <tbody>
                                            {employees.map(user => (
                                                <tr key={user._id}>
                                                    <td className="font-bold">{user.name}</td>
                                                    <td>{user.email}</td>
                                                    <td className="flex gap-2">
                                                        <button onClick={() => { setEditItem(user); setModalType('employee'); setShowModal(true); }} className="btn btn-ghost btn-xs text-indigo-600"><FiEdit2 /></button>
                                                        <button onClick={() => handleDelete('users', user._id)} className="btn btn-ghost btn-xs text-red-500"><FiTrash2 /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}



                        {activeTab === 'feedback' && (
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-2xl mb-8">Mijoz Izohlari</h3>
                                <div className="space-y-4">
                                    {feedback.map(f => (
                                        <div key={f._id} className="p-4 bg-gray-50 rounded-2xl">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-bold text-indigo-600">⭐ {f.rating}/5</span>
                                                <span className="text-xs text-gray-400">#{f.order?.dailyNumber}</span>
                                            </div>
                                            <p className="italic text-gray-600">"{f.comment}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Reused Modals from SuperAdmin or simplified ones here */}
            {showModal && (
                <div className="modal modal-open bg-black/40 backdrop-blur-sm shadow-2xl">
                    <div className="modal-box rounded-3xl p-8 max-w-xl">
                        <h3 className="font-bold text-2xl mb-6">{editItem ? 'Tahrirlash' : 'Yangi qo\'shish'}</h3>
                        {modalType === 'employee' ? (
                            <form
                                key={editItem?._id || 'new-employee'}
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const name = e.target.name.value;
                                    const email = e.target.email.value;
                                    const password = e.target.password?.value;

                                    try {
                                        if (editItem) {
                                            const updateData = { name, email };
                                            if (password) updateData.password = password;
                                            await api.patch(`/users/${editItem._id}`, updateData);
                                        } else {
                                            await api.post('/users', { name, email, password, role: 'employee' });
                                        }
                                        showToast('Saqlandi', 'success');
                                        setShowModal(false);
                                        fetchData();
                                    } catch (err) {
                                        showToast(err.response?.data?.error || 'Xatolik', 'error');
                                    }
                                }} className="space-y-4">
                                <div className="form-control">
                                    <label className="label text-xs font-bold text-gray-400 uppercase">F.I.SH.</label>
                                    <input name="name" defaultValue={editItem?.name} className="input input-bordered w-full rounded-xl" required />
                                </div>
                                <div className="form-control">
                                    <label className="label text-xs font-bold text-gray-400 uppercase">Email</label>
                                    <input name="email" type="email" defaultValue={editItem?.email} className="input input-bordered w-full rounded-xl" required />
                                </div>
                                <div className="form-control">
                                    <label className="label text-xs font-bold text-gray-400 uppercase">Parol {editItem && "(o'zgartirish uchun)"}</label>
                                    <input name="password" type="password" className="input input-bordered w-full rounded-xl" required={!editItem} />
                                </div>
                                <div className="modal-action">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost rounded-xl">Bekor qilish</button>
                                    <button type="submit" className="btn btn-primary rounded-xl px-10 shadow-lg shadow-indigo-100">Saqlash</button>
                                </div>
                            </form>
                        ) : (
                            <MenuForm
                                key={editItem?._id || 'new-menu'}
                                item={editItem}
                                onCancel={() => setShowModal(false)}
                                onSuccess={() => { setShowModal(false); fetchData(); }}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Add the same MenuForm component or a slightly modified one
const MenuForm = ({ item, onCancel, onSuccess }) => {
    const [formData, setFormData] = useState(item || { name: '', description: '', price: '', category: 'classic', image: '', ingredients: [] });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                try {
                    const response = await api.post('/menu/upload-image', { image: reader.result });
                    setFormData(prev => ({ ...prev, image: response.data.imageUrl }));
                    showToast('Rasm yuklandi', 'success');
                } catch (err) {
                    showToast('Rasm yuklashda xatolik: ' + (err.response?.data?.error || err.message), 'error');
                } finally {
                    setUploading(false);
                }
            };
        } catch (error) {
            showToast('Rasm yuklashda xatolik', 'error');
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.image) return showToast('Rasm yuklash shart', 'error');
        setSubmitting(true);
        try {
            if (item) {
                const { _id, __v, createdAt, updatedAt, ...updateData } = formData;
                await api.patch(`/menu/${item._id}`, updateData);
            } else {
                await api.post('/menu', formData);
            }
            showToast('Saqlandi', 'success');
            onSuccess();
        } catch (error) {
            showToast(error.response?.data?.error || 'Xatolik', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <input placeholder="Nomi" className="input input-bordered rounded-xl" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} required />
                <input type="number" placeholder="Narxi" className="input input-bordered rounded-xl" value={formData.price} onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))} required />
            </div>
            <textarea placeholder="Tavsif" className="textarea textarea-bordered rounded-xl w-full h-24" value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} required />
            <div className="grid grid-cols-2 gap-4">
                <select className="select select-bordered rounded-xl" value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}>
                    <option value="classic">Classic</option>
                    <option value="premium">Premium</option>
                    <option value="combo">Combo</option>
                    <option value="sides">Sides</option>
                    <option value="drinks">Drinks</option>
                </select>
                <div className="flex flex-col gap-2">
                    {formData.image && <img src={formData.image} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />}
                    <input type="file" accept="image/*" className="file-input file-input-bordered file-input-xs rounded-lg" onChange={handleImageChange} disabled={uploading} />
                </div>
            </div>
            <div className="modal-action">
                <button type="button" onClick={onCancel} className="btn btn-ghost rounded-xl">Bekor qilish</button>
                <button type="submit" disabled={submitting || uploading} className="btn btn-primary rounded-xl px-10 shadow-lg shadow-indigo-100">Saqlash</button>
            </div>
        </form>
    );
};
