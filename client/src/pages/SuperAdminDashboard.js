import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllUsers, getAllOrders, getMenuItems, getAllFeedback, addMenuItem, updateMenuItem, deleteMenuItem, deleteOrder } from '../utils/firestore';
import { uploadImage } from '../utils/storageService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { showToast } from '../components/shared/Toast';
import { FiUsers, FiShoppingBag, FiBox, FiMessageSquare, FiLogOut, FiTrash2, FiShield, FiPlus, FiEdit2, FiUpload } from 'react-icons/fi';

export default function SuperAdminDashboard() {
    const [activeTab, setActiveTab] = useState('users');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const { logout } = useAuth();

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
            let result = [];
            switch (activeTab) {
                case 'users':    result = await getAllUsers(); break;
                case 'orders':   result = await getAllOrders(); break;
                case 'menu':     result = await getMenuItems(); break;
                case 'feedback': result = await getAllFeedback(); break;
                default:         result = await getAllUsers();
            }
            setData(result);
        } catch (error) {
            showToast('Ma\'lumotlarni yuklab bo\'lmadi', 'error');
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => { fetchData(); }, [fetchData]);

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
                const { updateUserProfile } = await import('../utils/firestore');
                await updateUserProfile(editItem.id, { name: userFormData.name, email: userFormData.email, role: userFormData.role });
                showToast('Foydalanuvchi yangilandi!', 'success');
            } else {
                showToast('Yangi foydalanuvchi qo\'shish uchun seed.js ni ishlating', 'info');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            showToast('Xatolik: ' + error.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleMenuSubmit = async (e) => {
        e.preventDefault();
        if (!menuFormData.image && !menuFormData.imageUrl) return showToast('Rasm yuklash shart!', 'error');
        setSubmitting(true);
        try {
            const cleanData = {
                name: menuFormData.name,
                description: menuFormData.description,
                price: Number(menuFormData.price),
                category: menuFormData.category,
                imageUrl: menuFormData.imageUrl || menuFormData.image,
                available: menuFormData.available ?? true,
            };
            if (editItem) {
                await updateMenuItem(editItem.id, cleanData);
                showToast('Mahsulot yangilandi!', 'success');
            } else {
                await addMenuItem(cleanData);
                showToast('Mahsulot yaratildi!', 'success');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            showToast('Xatolik: ' + error.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadImage(file, 'menu');
            setMenuFormData(prev => ({ ...prev, image: url, imageUrl: url }));
            showToast('Rasm muvaffaqiyatli yuklandi', 'success');
        } catch (err) {
            showToast('Rasm yuklashda xatolik: ' + err.message, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id, roleOrLabel) => {
        if (roleOrLabel === 'super-admin') {
            showToast('Asosiy Super-Adminni o\'chirib bo\'lmaydi!', 'error');
            return;
        }

        if (!window.confirm('Haqiqatdan ham o\'chirmoqchimisiz?')) return;

        try {
            switch (activeTab) {
                case 'orders': await deleteOrder(id); break;
                case 'menu':   await deleteMenuItem(id); break;
                case 'users':  showToast('User o\'chirish Firebase Admin orqali bajariladi', 'info'); return;
                default: return;
            }
            showToast('Muvaffaqiyatli o\'chirildi', 'success');
            setData(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Delete error:', error);
            showToast('O\'chirishda xatolik: ' + error.message, 'error');
        }
    };

    return (
        <div className="min-h-screen bg-base-300 text-base-content font-sans transition-colors duration-300">
            <nav className="navbar bg-base-100/80 backdrop-blur-xl border-b border-base-content/5 px-6 sticky top-0 z-40 h-20">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-700 rounded-xl shadow-lg border border-red-400/20">
                            <FiShield className="text-white text-lg" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-black tracking-tight leading-none text-base-content uppercase">Super Admin</span>
                            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-red-500 mt-1">Sistemani boshqarish</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={logout} className="btn btn-ghost btn-sm bg-base-content/5 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all gap-2 border-0">
                        <FiLogOut /> <span className="hidden sm:inline">Chiqish</span>
                    </button>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-700">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                    <div className="inline-flex p-1 bg-base-100/50 rounded-2xl border border-base-content/5 backdrop-blur-sm overflow-x-auto max-w-full">
                        {[
                            { id: 'users', label: 'Foydalanuvchilar', icon: <FiUsers /> },
                            { id: 'orders', label: 'Buyurtmalar', icon: <FiShoppingBag /> },
                            { id: 'menu', label: 'Menu', icon: <FiBox /> },
                            { id: 'feedback', label: 'Izohlar', icon: <FiMessageSquare /> },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-red-500 text-white shadow-xl shadow-red-500/20 scale-105' : 'text-base-content/60 hover:text-base-content hover:bg-base-100/50'}`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    {(activeTab === 'users' || activeTab === 'menu') && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="btn btn-error btn-md rounded-2xl gap-2 font-black shadow-xl shadow-red-500/20 text-white w-full lg:w-auto"
                        >
                            <FiPlus className="text-lg" /> {activeTab === 'users' ? 'Xodim' : 'Mahsulot'} Qo'shish
                        </button>
                    )}
                </div>

                <div className="bg-base-100/30 rounded-[2.5rem] border border-base-content/5 overflow-hidden backdrop-blur-2xl shadow-xl">
                    <div className="p-8 border-b border-base-content/5 flex justify-between items-center bg-gradient-to-r from-base-content/5 to-transparent">
                        <h2 className="text-2xl font-black capitalize text-base-content">{activeTab} Boshqaruvi</h2>
                        <span className="px-4 py-2 bg-base-300 rounded-full border border-base-content/10 font-mono text-[10px] text-base-content/60 uppercase">Jami: {data.length}</span>
                    </div>

                    {loading ? (
                        <div className="p-32 flex justify-center"><LoadingSpinner /></div>
                    ) : (data.length === 0 ? (
                        <div className="p-32 text-center opacity-30 italic font-black uppercase tracking-widest">Ma'lumotlar mavjud emas</div>
                    ) : (
                        <div className="overflow-x-auto p-4">
                            <table className="table w-full border-separate border-spacing-y-3">
                                <thead className="text-base-content/40 text-[11px] font-black uppercase tracking-widest border-0">
                                    <tr>
                                        {activeTab === 'users' && <><th>Xodim</th><th>Email</th><th>Rol</th></>}
                                        {activeTab === 'orders' && <><th>ID</th><th>Mijoz</th><th>Summa</th><th>Holat</th></>}
                                        {activeTab === 'menu' && <><th>Rasm</th><th>Nomi</th><th>Narxi</th><th>Kategoriya</th></>}
                                        {activeTab === 'feedback' && <><th>Reyting</th><th>Izoh</th><th>Buyurtma</th></>}
                                        <th className="text-right px-6">Amallar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item) => (
                                        <tr key={item.id || item._id} className="bg-base-100/40 hover:bg-base-100/60 transition-all rounded-3xl border-0 group">
                                            {activeTab === 'users' && (
                                                <>
                                                    <td className="font-bold text-base-content uppercase rounded-l-3xl">{item.name}</td>
                                                    <td className="text-base-content/60">{item.email}</td>
                                                    <td><div className="badge badge-sm rounded-lg font-black text-[9px] bg-red-500/20 text-red-500 border-0">{item.role?.toUpperCase()}</div></td>
                                                </>
                                            )}
                                            {activeTab === 'orders' && (
                                                <>
                                                    <td className="font-black text-red-500 rounded-l-3xl">#{item.dailyNumber}</td>
                                                    <td className="font-bold text-base-content">{item.customerName}</td>
                                                    <td className="font-black text-emerald-500">{item.totalPrice?.toLocaleString()} so'm</td>
                                                    <td><div className="badge badge-outline badge-xs opacity-50 uppercase font-black text-base-content">{item.status}</div></td>
                                                </>
                                            )}
                                            {activeTab === 'menu' && (
                                                <>
                                                    <td className="rounded-l-3xl"><img src={item.image} alt="" className="w-10 h-10 rounded-xl object-cover shadow-lg" /></td>
                                                    <td className="font-bold text-base-content">{item.name}</td>
                                                    <td className="text-emerald-500 font-bold">{item.price?.toLocaleString()} so'm</td>
                                                    <td><span className="opacity-50 text-[10px] font-bold uppercase text-base-content">{item.category}</span></td>
                                                </>
                                            )}
                                            {activeTab === 'feedback' && (
                                                <>
                                                    <td className="rounded-l-3xl text-amber-500 font-black">⭐ {item.rating}</td>
                                                    <td className="max-w-xs truncate italic text-base-content/60">{item.comment}</td>
                                                    <td className="opacity-40 font-black tracking-tighter text-[10px] text-base-content">BUYURTMA #{item.order?.dailyNumber || '???'}</td>
                                                </>
                                            )}
                                            <td className="text-right rounded-r-3xl px-6">
                                                <div className="flex justify-end gap-2">
                                                    {(activeTab === 'users' || activeTab === 'menu') && (
                                                        <button onClick={() => handleOpenModal(item)} className="btn btn-ghost btn-xs text-blue-400 hover:bg-blue-400/10"><FiEdit2 /></button>
                                                    )}
                                                    <button onClick={() => handleDelete(item.id || item._id, item.role)} className="btn btn-ghost btn-xs text-red-500 hover:bg-red-500/10"><FiTrash2 /></button>
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
                <div className="modal modal-open bg-base-300/90 backdrop-blur-2xl">
                    <div className="modal-box bg-base-100 border border-base-content/10 rounded-[3rem] p-10 max-w-md shadow-4xl overflow-visible">
                        <div className="text-center mb-8">
                            <h3 className="text-3xl font-black text-base-content uppercase">{editItem ? 'Tahrirlash' : 'Yangi Qo\'shish'}</h3>
                        </div>

                        {activeTab === 'users' ? (
                            <form onSubmit={handleUserSubmit} className="space-y-4">
                                <input type="text" placeholder="Ism-sharif" className="input input-bordered w-full bg-base-200 border-0 rounded-2xl font-bold" value={userFormData.name} onChange={e => setUserFormData({ ...userFormData, name: e.target.value })} required />
                                <input type="email" placeholder="Email" className="input input-bordered w-full bg-base-200 border-0 rounded-2xl font-bold" value={userFormData.email} onChange={e => setUserFormData({ ...userFormData, email: e.target.value })} required />
                                <input type="password" placeholder={`Parol ${editItem ? '(ixtiyoriy)' : ''}`} className="input input-bordered w-full bg-base-200 border-0 rounded-2xl font-bold" value={userFormData.password} onChange={e => setUserFormData({ ...userFormData, password: e.target.value })} required={!editItem} />
                                <select
                                    className="select select-bordered w-full bg-base-200 border-0 rounded-2xl font-bold"
                                    value={userFormData.role}
                                    onChange={e => setUserFormData({ ...userFormData, role: e.target.value })}
                                >
                                    <option value="employee">Staff (Hodim)</option>
                                    <option value="boss">Boss (Boshliq)</option>
                                    <option value="super-admin">Admin (S.Admin)</option>
                                    <option value="customer">Mijoz (Client)</option>
                                </select>
                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost flex-1 rounded-2xl font-bold">BEKOR</button>
                                    <button type="submit" disabled={submitting} className="btn btn-error flex-2 rounded-2xl font-black text-white">{submitting ? '...' : 'SAQLASH'}</button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleMenuSubmit} className="space-y-4">
                                <input placeholder="Nomi" className="input input-bordered w-full bg-base-200 border-0 rounded-2xl font-bold" value={menuFormData.name} onChange={e => setMenuFormData({ ...menuFormData, name: e.target.value })} required />
                                <textarea placeholder="Tavsif" className="textarea textarea-bordered w-full bg-base-200 border-0 rounded-2xl font-bold" value={menuFormData.description} onChange={e => setMenuFormData({ ...menuFormData, description: e.target.value })} required />
                                <input type="number" placeholder="Narxi" className="input input-bordered w-full bg-base-200 border-0 rounded-2xl font-bold" value={menuFormData.price} onChange={e => setMenuFormData({ ...menuFormData, price: e.target.value })} required />
                                <select className="select select-bordered w-full bg-base-200 border-0 rounded-2xl font-bold" value={menuFormData.category} onChange={e => setMenuFormData({ ...menuFormData, category: e.target.value })}>
                                    <option value="classic">Classic</option>
                                    <option value="premium">Premium</option>
                                    <option value="combo">Combo</option>
                                    <option value="drinks">Drinks</option>
                                    <option value="sides">Sides</option>
                                </select>
                                <div className="flex items-center gap-4 bg-base-200 p-4 rounded-2xl">
                                    {menuFormData.image && <img src={menuFormData.image} alt="" className="w-12 h-12 rounded-lg object-cover shadow-md" />}
                                    <label className="btn btn-ghost btn-sm gap-2 opacity-60">
                                        <FiUpload /> {uploading ? 'Yuklanmoqda...' : 'Rasm Tanlash'}
                                        <input type="file" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                    </label>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost flex-1 rounded-2xl font-bold">BEKOR</button>
                                    <button type="submit" disabled={submitting || uploading} className="btn btn-error flex-2 rounded-2xl font-black text-white">{submitting ? '...' : 'SAQLASH'}</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
