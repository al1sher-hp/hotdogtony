import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { showToast } from '../components/shared/Toast';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { FiUsers, FiShoppingBag, FiBox, FiMessageSquare, FiTrash2, FiPlus, FiEdit2, FiCheck } from 'react-icons/fi';

export default function SuperAdminDashboard() {
    const [activeTab, setActiveTab] = useState('users');
    const { logout } = useAuth();
    const [loading, setLoading] = useState(true);

    // Data states
    const [users, setUsers] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [feedback, setFeedback] = useState([]);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'user', 'menu'
    const [editItem, setEditItem] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'users') {
                const res = await api.get('/users');
                setUsers(res.data.users);
            } else if (activeTab === 'menu') {
                const res = await api.get('/menu');
                setMenuItems(res.data.menuItems);
            } else if (activeTab === 'ingredients') {
                const res = await api.get('/ingredients');
                setIngredients(res.data.ingredients);
            } else if (activeTab === 'feedback') {
                const res = await api.get('/feedback');
                setFeedback(res.data.feedbacks);
            }
        } catch (error) {
            showToast('Ma\'lumotlarni yuklashda xatolik', 'error');
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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

    return (
        <div className="min-h-screen bg-base-200">
            {/* Header */}
            <div className="navbar bg-gradient-to-r from-purple-800 to-indigo-900 text-white shadow-lg sticky top-0 z-50">
                <div className="flex-1 px-4">
                    <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                        <span className="bg-white text-indigo-900 p-1 rounded-lg">🔐</span>
                        Super Admin Panel
                    </h1>
                </div>
                <div className="flex-none gap-2 px-4">
                    <button onClick={logout} className="btn btn-ghost btn-sm border border-white/20">Chiqish</button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Tabs Navigation */}
                <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm">
                    {[
                        { id: 'users', label: 'Xodimlar', icon: <FiUsers /> },
                        { id: 'menu', label: 'Menyu', icon: <FiShoppingBag /> },
                        { id: 'ingredients', label: 'Masalliqlar', icon: <FiBox /> },
                        { id: 'feedback', label: 'Fikr-mulohaza', icon: <FiMessageSquare /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all font-medium ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-md scale-105'
                                : 'hover:bg-indigo-50 text-gray-600'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[60vh] border border-gray-100">
                    <div className="p-6 md:p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeTab} Boshqaruvi</h2>
                            {activeTab !== 'feedback' && (
                                <button
                                    onClick={() => {
                                        setModalType(activeTab === 'users' ? 'user' : 'menu');
                                        setEditItem(null);
                                        setShowModal(true);
                                    }}
                                    className="btn btn-primary rounded-xl gap-2 shadow-lg shadow-indigo-200"
                                >
                                    <FiPlus /> Qo'shish
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="py-20 flex flex-col items-center gap-4">
                                <LoadingSpinner size="lg" />
                                <p className="text-gray-400">Ma'lumotlar yuklanmoqda...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                {activeTab === 'users' && <UsersTable users={users} onDelete={handleDelete} onEdit={(u) => { setEditItem(u); setModalType('user'); setShowModal(true); }} />}
                                {activeTab === 'menu' && <MenuTable items={menuItems} onDelete={handleDelete} onEdit={(i) => { setEditItem(i); setModalType('menu'); setShowModal(true); }} />}
                                {activeTab === 'ingredients' && <IngredientsTable items={ingredients} fetchData={fetchData} />}
                                {activeTab === 'feedback' && <FeedbackList feedback={feedback} />}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showModal && (
                <div className="modal modal-open bg-black/50 backdrop-blur-sm">
                    <div className="modal-box max-w-2xl rounded-3xl p-8 border border-white/20">
                        <h3 className="font-bold text-2xl mb-6 flex items-center gap-2">
                            {editItem ? <FiEdit2 className="text-indigo-600" /> : <FiPlus className="text-green-600" />}
                            {editItem ? 'Tahrirlash' : 'Yangi qo\'shish'}
                        </h3>

                        {modalType === 'user' && (
                            <UserForm
                                item={editItem}
                                onCancel={() => setShowModal(false)}
                                onSuccess={() => { setShowModal(false); fetchData(); }}
                            />
                        )}

                        {modalType === 'menu' && (
                            <MenuForm
                                item={editItem}
                                ingredients={ingredients}
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

const UsersTable = ({ users, onDelete, onEdit }) => (
    <table className="table w-full">
        <thead>
            <tr className="bg-indigo-50/50">
                <th className="rounded-l-xl">Ism</th>
                <th>Email</th>
                <th>Rol</th>
                <th className="rounded-r-xl">Amallar</th>
            </tr>
        </thead>
        <tbody>
            {users.map(user => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                    <td className="font-semibold text-gray-900">{user.name}</td>
                    <td className="text-gray-600">{user.email}</td>
                    <td>
                        <span className={`badge badge-ghost capitalize font-medium ${user.role === 'super-admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'boss' ? 'bg-blue-100 text-blue-700' :
                                'bg-green-100 text-green-700'
                            }`}>
                            {user.role}
                        </span>
                    </td>
                    <td className="flex gap-2">
                        <button onClick={() => onEdit(user)} className="btn btn-ghost btn-xs text-indigo-600 hover:bg-indigo-50 rounded-lg"><FiEdit2 /></button>
                        <button onClick={() => onDelete('users', user._id)} className="btn btn-ghost btn-xs text-red-400 hover:bg-red-50 rounded-lg"><FiTrash2 /></button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

const MenuTable = ({ items, onDelete, onEdit }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
            <div key={item._id} className="card bg-gray-50/50 hover:bg-white border border-gray-100 hover:border-indigo-100 transition-all hover:shadow-xl hover:shadow-indigo-100/30 group">
                <figure className="relative h-48 overflow-hidden m-4 rounded-2xl">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 flex gap-1">
                        <button onClick={() => onEdit(item)} className="btn btn-circle btn-sm bg-white/90 border-0 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm"><FiEdit2 size={14} /></button>
                        <button onClick={() => onDelete('menu', item._id)} className="btn btn-circle btn-sm bg-white/90 border-0 text-red-500 hover:bg-red-500 hover:text-white shadow-sm"><FiTrash2 size={14} /></button>
                    </div>
                </figure>
                <div className="card-body p-6 pt-0">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800">{item.name}</h3>
                        <span className="text-indigo-600 font-bold">{item.price?.toLocaleString()} s.</span>
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>
                    <div className="card-actions mt-4">
                        <span className="badge badge-outline border-indigo-200 text-indigo-400 text-xs px-3">{item.category}</span>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const IngredientsTable = ({ items, fetchData }) => {
    const [updating, setUpdating] = useState(null);

    const updateStock = async (id, currentStock) => {
        setUpdating(id);
        try {
            await api.patch(`/ingredients/${id}`, { currentStock });
            showToast('Zaxira yangilandi', 'success');
            fetchData();
        } catch (error) {
            showToast('Yangilashda xatolik', 'error');
        } finally {
            setUpdating(null);
        }
    };

    return (
        <table className="table w-full">
            <thead>
                <tr className="bg-indigo-50/50">
                    <th className="rounded-l-xl">Nomi</th>
                    <th>Joriy zaxira</th>
                    <th>Holati</th>
                    <th className="rounded-r-xl">Harakat</th>
                </tr>
            </thead>
            <tbody>
                {items.map(ing => {
                    const status = ing.currentStock <= ing.minStock ? 'tugayapti' : 'yetarli';
                    return (
                        <tr key={ing._id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                            <td className="font-semibold text-gray-900">{ing.name} ({ing.unit})</td>
                            <td>
                                <input
                                    type="number"
                                    defaultValue={ing.currentStock}
                                    onBlur={(e) => updateStock(ing._id, e.target.value)}
                                    className="input input-sm input-bordered w-24 rounded-lg focus:border-indigo-500 focus:outline-none"
                                    disabled={updating === ing._id}
                                />
                            </td>
                            <td>
                                <span className={`badge badge-sm font-medium ${status === 'tugayapti' ? 'badge-error' : 'badge-success'}`}>
                                    {status}
                                </span>
                            </td>
                            <td>
                                {updating === ing._id ? <LoadingSpinner size="sm" /> : <FiCheck className="text-green-500" />}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

const FeedbackList = ({ feedback }) => (
    <div className="space-y-4">
        {feedback.map(f => (
            <div key={f._id} className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 flex gap-4 hover:bg-white transition-colors shadow-sm hover:shadow-md">
                <div className="avatar placeholder h-fit">
                    <div className="bg-indigo-100 text-indigo-600 rounded-xl w-12">
                        <span className="text-xl font-bold">⭐</span>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="font-bold text-lg text-indigo-600">{f.rating}/5</span>
                            <p className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleString('uz-UZ')}</p>
                        </div>
                        <div className="badge badge-ghost border-0 text-gray-400 text-xs">Buyurtma #{f.order?.dailyNumber}</div>
                    </div>
                    <p className="text-gray-700 italic">"{f.comment || 'Izoh qoldirilmagan'}"</p>
                </div>
            </div>
        ))}
    </div>
);

// Forms
const UserForm = ({ item, onCancel, onSuccess }) => {
    const [formData, setFormData] = useState(item || { name: '', email: '', password: '', role: 'employee' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (item) {
                // Strip fields that shouldn't be patched
                const { _id, __v, createdAt, updatedAt, ...updateData } = formData;
                await api.patch(`/users/${item._id}`, updateData);
            } else {
                await api.post('/users', formData);
            }
            showToast('Foydalanuvchi saqlandi', 'success');
            onSuccess();
        } catch (error) {
            showToast(error.response?.data?.error || 'Xatolik', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
                <label className="label text-sm font-bold text-gray-600 uppercase">Ism-sharif</label>
                <input
                    type="text"
                    className="input input-bordered rounded-xl bg-gray-50 focus:bg-white"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>
            <div className="form-control">
                <label className="label text-sm font-bold text-gray-600 uppercase">Email</label>
                <input
                    type="email"
                    className="input input-bordered rounded-xl bg-gray-50 focus:bg-white"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                />
            </div>
            {!item && (
                <div className="form-control">
                    <label className="label text-sm font-bold text-gray-600 uppercase">Parol</label>
                    <input
                        type="password"
                        className="input input-bordered rounded-xl bg-gray-50 focus:bg-white"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                </div>
            )}
            <div className="form-control">
                <label className="label text-sm font-bold text-gray-600 uppercase">Rol</label>
                <select
                    className="select select-bordered rounded-xl bg-gray-50 focus:bg-white"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                    <option value="employee">Hodim</option>
                    <option value="boss">Boss</option>
                    <option value="super-admin">Super Admin</option>
                </select>
            </div>
            <div className="modal-action">
                <button type="button" onClick={onCancel} className="btn btn-ghost rounded-xl">Bekor qilish</button>
                <button type="submit" disabled={submitting} className="btn btn-primary px-8 rounded-xl shadow-lg shadow-indigo-100">
                    {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
            </div>
        </form>
    );
};

const MenuForm = ({ item, ingredients, onCancel, onSuccess }) => {
    const [formData, setFormData] = useState(item || { name: '', description: '', price: '', category: 'classic', image: '', ingredients: [] });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (item) {
                const { _id, __v, createdAt, updatedAt, ...updateData } = formData;
                await api.patch(`/menu/${item._id}`, updateData);
            } else {
                await api.post('/menu', formData);
            }
            showToast('Mahsulot saqlandi', 'success');
            onSuccess();
        } catch (error) {
            showToast('Xatolik', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                    <label className="label text-sm font-bold text-gray-600 uppercase">Nomi</label>
                    <input type="text" className="input input-bordered rounded-xl" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-control">
                    <label className="label text-sm font-bold text-gray-600 uppercase">Narxi</label>
                    <input type="number" className="input input-bordered rounded-xl" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                </div>
            </div>
            <div className="form-control">
                <label className="label text-sm font-bold text-gray-600 uppercase">Tavsif</label>
                <textarea className="textarea textarea-bordered rounded-xl h-24" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                    <label className="label text-sm font-bold text-gray-600 uppercase">Kategoriya</label>
                    <select className="select select-bordered rounded-xl" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                        <option value="classic">Classic</option>
                        <option value="premium">Premium</option>
                        <option value="combo">Combo</option>
                        <option value="drinks">Drinks</option>
                    </select>
                </div>
                <div className="form-control">
                    <label className="label text-sm font-bold text-gray-600 uppercase">Rasm URL</label>
                    <input type="text" className="input input-bordered rounded-xl" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} required />
                </div>
            </div>
            <div className="modal-action">
                <button type="button" onClick={onCancel} className="btn btn-ghost rounded-xl">Bekor qilish</button>
                <button type="submit" disabled={submitting} className="btn btn-primary px-8 rounded-xl">
                    {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
            </div>
        </form>
    );
};
