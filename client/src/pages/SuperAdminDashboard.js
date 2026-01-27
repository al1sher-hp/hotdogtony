import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { showToast } from '../components/shared/Toast';
import { FiUsers, FiShoppingBag, FiBox, FiMessageSquare, FiLogOut, FiTrash2, FiShield, FiPlus, FiEdit2, FiCheck, FiX, FiUpload } from 'react-icons/fi';

export default function SuperAdminDashboard() {
    const [activeTab, setActiveTab] = useState('users');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const { user: currentUser, logout } = useAuth();

    // User Form State
    const [userFormData, setUserFormData] = useState({
        name: '', email: '', password: '', role: 'employee'
    });

    // Menu Form State
    const [menuFormData, setMenuFormData] = useState({
        name: '', description: '', price: '', category: 'classic', image: '', available: true
    });
    const [uploading, setUploading] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let endpoint = '';
            switch (activeTab) {
                case 'users': endpoint = '/users'; break;
                case 'orders': endpoint = '/orders'; break;
                case 'menu': endpoint = '/menu'; break;
                case 'feedback': endpoint = '/feedback'; break;
                default: endpoint = '/users';
            }
            const res = await api.get(endpoint);
            const result = res.data.users || res.data.orders || res.data.menuItems || res.data.feedbacks || [];
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
        if (activeTab === 'users') {
            if (item) {
                setEditItem(item);
                setUserFormData({
                    name: item.name || '',
                    email: item.email || '',
                    password: '',
                    role: item.role || 'employee'
                });
            } else {
                setEditItem(null);
                setUserFormData({ name: '', email: '', password: '', role: 'employee' });
            }
        } else if (activeTab === 'menu') {
            if (item) {
                setEditItem(item);
                setMenuFormData({
                    name: item.name || '',
                    description: item.description || '',
                    price: item.price || '',
                    category: item.category || 'classic',
                    image: item.image || '',
                    available: item.available ?? true
                });
            } else {
                setEditItem(null);
                setMenuFormData({ name: '', description: '', price: '', category: 'classic', image: '', available: true });
            }
        }
        setShowModal(true);
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editItem) {
                await api.patch(`/users/${editItem._id}`, userFormData);
                showToast('Foydalanuvchi yangilandi!', 'success');
            } else {
                await api.post('/users', userFormData);
                showToast('Foydalanuvchi yaratildi!', 'success');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.error || 'Xatolik', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleMenuSubmit = async (e) => {
        e.preventDefault();
        if (!menuFormData.image) return showToast('Rasm yuklash shart!', 'error');
        setSubmitting(true);
        try {
            if (editItem) {
                await api.patch(`/menu/${editItem._id}`, menuFormData);
                showToast('Mahsulot yangilandi!', 'success');
            } else {
                await api.post('/menu', menuFormData);
                showToast('Mahsulot yaratildi!', 'success');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.error || 'Xatolik', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                try {
                    const res = await api.post('/menu/upload-image', { image: reader.result });
                    setMenuFormData(prev => ({ ...prev, image: res.data.imageUrl }));
                    showToast('Rasm muvaffaqiyatli yuklandi', 'success');
                } catch (err) {
                    showToast('Rasm yuklashda xatolik', 'error');
                } finally {
                    setUploading(false);
                }
            };
        } catch (error) {
            showToast('Faylni o\'qishda xatolik', 'error');
            setUploading(false);
        }
    };

    const handleDelete = async (id, roleOrLabel) => {
        if (roleOrLabel === 'super-admin') {
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
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            <nav className="navbar bg-slate-900/40 border-b border-white/5 px-6 sticky top-0 z-40 backdrop-blur-xl">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-700 rounded-xl shadow-lg border border-red-400/20">
                            <FiShield className="text-white text-lg" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-black tracking-tight leading-none text-white uppercase">Super Admin</span>
                            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-red-500 mt-1">Sistemani boshqarish</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={logout} className="btn btn-ghost btn-sm bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all gap-2 border-0">
                        <FiLogOut /> <span className="hidden sm:inline">Chiqish</span>
                    </button>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                    <div className="inline-flex p-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm overflow-x-auto max-w-full">
                        {[
                            { id: 'users', label: 'Foydalanuvchilar', icon: <FiUsers /> },
                            { id: 'orders', label: 'Buyurtmalar', icon: <FiShoppingBag /> },
                            { id: 'menu', label: 'Menu', icon: <FiBox /> },
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

                    {(activeTab === 'users' || activeTab === 'menu') && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="btn btn-error btn-md rounded-2xl gap-2 font-black shadow-xl shadow-red-500/20 w-full lg:w-auto"
                        >
                            <FiPlus className="text-lg" /> {activeTab === 'users' ? 'Xodim' : 'Mahsulot'} Qo'shish
                        </button>
                    )}
                </div>

                <div className="bg-slate-900/30 rounded-[2.5rem] border border-white/5 overflow-hidden backdrop-blur-2xl">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent">
                        <h2 className="text-2xl font-black capitalize text-white">{activeTab} Boshqaruvi</h2>
                        <span className="px-4 py-2 bg-slate-900 rounded-full border border-white/5 font-mono text-[10px] text-slate-400 uppercase">Jami: {data.length}</span>
                    </div>

                    {loading ? (
                        <div className="p-32 flex justify-center"><LoadingSpinner /></div>
                    ) : (data.length === 0 ? (
                        <div className="p-32 text-center opacity-30 italic">Ma'lumotlar mavjud emas</div>
                    ) : (
                        <div className="overflow-x-auto p-4">
                            <table className="table w-full border-separate border-spacing-y-3">
                                <thead className="text-slate-500 text-[11px] font-black uppercase tracking-widest">
                                    <tr className="border-0">
                                        {activeTab === 'users' && <><th>Xodim</th><th>Email</th><th>Rol</th></>}
                                        {activeTab === 'orders' && <><th>ID</th><th>Mijoz</th><th>Summa</th><th>Holat</th></>}
                                        {activeTab === 'menu' && <><th>Rasm</th><th>Nomi</th><th>Narxi</th><th>Kategoriya</th></>}
                                        {activeTab === 'feedback' && <><th>Reyting</th><th>Izoh</th><th>Buyurtma</th></>}
                                        <th className="text-right px-6">Amallar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item) => (
                                        <tr key={item._id} className="bg-white/5 hover:bg-white/10 transition-all rounded-3xl">
                                            {activeTab === 'users' && (
                                                <>
                                                    <td className="font-bold text-white uppercase rounded-l-3xl">{item.name}</td>
                                                    <td className="text-slate-400">{item.email}</td>
                                                    <td><div className="badge badge-sm rounded-lg font-black text-[9px] bg-red-500/20 text-red-500 border-0">{item.role.toUpperCase()}</div></td>
                                                </>
                                            )}
                                            {activeTab === 'orders' && (
                                                <>
                                                    <td className="font-black text-red-500 rounded-l-3xl">#{item.dailyNumber}</td>
                                                    <td className="font-bold">{item.customerName}</td>
                                                    <td className="font-black text-emerald-400">{item.totalPrice?.toLocaleString()} so'm</td>
                                                    <td><div className="badge badge-outline badge-xs opacity-50 uppercase font-black">{item.status}</div></td>
                                                </>
                                            )}
                                            {activeTab === 'menu' && (
                                                <>
                                                    <td className="rounded-l-3xl"><img src={item.image} alt="" className="w-10 h-10 rounded-xl object-cover" /></td>
                                                    <td className="font-bold">{item.name}</td>
                                                    <td className="text-emerald-400 font-bold">{item.price?.toLocaleString()} so'm</td>
                                                    <td><span className="opacity-40 text-[10px] font-bold uppercase">{item.category}</span></td>
                                                </>
                                            )}
                                            {activeTab === 'feedback' && (
                                                <>
                                                    <td className="rounded-l-3xl text-amber-500 font-black">⭐ {item.rating}</td>
                                                    <td className="max-w-xs truncate italic text-slate-400">{item.comment}</td>
                                                    <td className="opacity-40 font-black tracking-tighter text-[10px]">BUYURTMA #{item.order?.dailyNumber || '???'}</td>
                                                </>
                                            )}
                                            <td className="text-right rounded-r-3xl px-6">
                                                <div className="flex justify-end gap-2">
                                                    {(activeTab === 'users' || activeTab === 'menu') && (
                                                        <button onClick={() => handleOpenModal(item)} className="btn btn-ghost btn-xs text-blue-400 hover:bg-blue-400/10"><FiEdit2 /></button>
                                                    )}
                                                    <button onClick={() => handleDelete(item._id, item.role)} className="btn btn-ghost btn-xs text-red-500 hover:bg-red-500/10"><FiTrash2 /></button>
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

            {showModal && (
                <div className="modal modal-open bg-slate-950/90 backdrop-blur-2xl">
                    <div className="modal-box bg-slate-900 border border-white/10 rounded-[3rem] p-10 max-w-md shadow-4xl overflow-visible">
                        <div className="text-center mb-8">
                            <h3 className="text-3xl font-black text-white uppercase">{editItem ? 'Tahrirlash' : 'Yangi Qo\'shish'}</h3>
                        </div>

                        {activeTab === 'users' ? (
                            <form onSubmit={handleUserSubmit} className="space-y-4">
                                <input type="text" placeholder="Ism-sharif" className="input input-bordered w-full bg-white/5 rounded-2xl" value={userFormData.name} onChange={e => setUserFormData({ ...userFormData, name: e.target.value })} required />
                                <input type="email" placeholder="Email" className="input input-bordered w-full bg-white/5 rounded-2xl" value={userFormData.email} onChange={e => setUserFormData({ ...userFormData, email: e.target.value })} required />
                                <input type="password" placeholder={`Parol ${editItem ? '(ixtiyoriy)' : ''}`} className="input input-bordered w-full bg-white/5 rounded-2xl" value={userFormData.password} onChange={e => setUserFormData({ ...userFormData, password: e.target.value })} required={!editItem} />
                                <select className="select select-bordered w-full bg-white/5 rounded-2xl" value={userFormData.role} onChange={e => setUserFormData({ ...userFormData, role: e.target.value })}>
                                    <option value="employee">Staff (Hodim)</option>
                                    <option value="boss">Boss (Boshliq)</option>
                                    <option value="super-admin">Admin (S.Admin)</option>
                                </select>
                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost flex-1 rounded-2xl">BEKOR</button>
                                    <button type="submit" disabled={submitting} className="btn btn-error flex-2 rounded-2xl font-black">{submitting ? '...' : 'SAQLASH'}</button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleMenuSubmit} className="space-y-4">
                                <input placeholder="Nomi" className="input input-bordered w-full bg-white/5 rounded-2xl" value={menuFormData.name} onChange={e => setMenuFormData({ ...menuFormData, name: e.target.value })} required />
                                <textarea placeholder="Tavsif" className="textarea textarea-bordered w-full bg-white/5 rounded-2xl" value={menuFormData.description} onChange={e => setMenuFormData({ ...menuFormData, description: e.target.value })} required />
                                <input type="number" placeholder="Narxi" className="input input-bordered w-full bg-white/5 rounded-2xl" value={menuFormData.price} onChange={e => setMenuFormData({ ...menuFormData, price: e.target.value })} required />
                                <select className="select select-bordered w-full bg-white/5 rounded-2xl" value={menuFormData.category} onChange={e => setMenuFormData({ ...menuFormData, category: e.target.value })}>
                                    <option value="classic">Classic</option>
                                    <option value="premium">Premium</option>
                                    <option value="combo">Combo</option>
                                    <option value="drinks">Drinks</option>
                                    <option value="sides">Sides</option>
                                </select>
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
                                    {menuFormData.image && <img src={menuFormData.image} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                                    <label className="btn btn-ghost btn-sm gap-2">
                                        <FiUpload /> {uploading ? 'Yuklanmoqda...' : 'Rasm Tanlash'}
                                        <input type="file" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                    </label>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost flex-1 rounded-2xl">BEKOR</button>
                                    <button type="submit" disabled={submitting || uploading} className="btn btn-error flex-2 rounded-2xl font-black">{submitting ? '...' : 'SAQLASH'}</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
