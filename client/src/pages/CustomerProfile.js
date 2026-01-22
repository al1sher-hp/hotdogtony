import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { showToast } from '../components/shared/Toast';
import { FiClock, FiLogOut } from 'react-icons/fi';

export default function CustomerProfile() {
    const [orders, setOrders] = useState([]);
    const [, setFavorites] = useState([]);
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
        if (user?.favoriteItems) {
            setFavorites(user.favoriteItems);
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
        showToast('Tizimdan chiqdingiz', 'info');
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-base-200">
            <div className="navbar bg-primary text-white">
                <button onClick={() => navigate('/menu')} className="btn btn-ghost">← Orqaga</button>
                <h1 className="flex-1 text-center text-2xl font-bold">Profil</h1>
                <button onClick={handleLogout} className="btn btn-ghost">
                    <FiLogOut />
                </button>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* User Info */}
                <div className="card bg-base-100 shadow-xl mb-6">
                    <div className="card-body text-center">
                        <div className="avatar placeholder mb-4">
                            <div className="bg-primary text-white rounded-full w-24">
                                <span className="text-4xl">{user?.name?.charAt(0)}</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold">{user?.name}</h2>
                        <p className="text-gray-600">{user?.email}</p>
                    </div>
                </div>

                {/* Order History */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title flex items-center gap-2">
                            <FiClock /> Buyurtma Tarixi
                        </h2>
                        {orders.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">Hali buyurtma yo'q</p>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order._id} className="bg-base-200 p-4 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="badge badge-primary">#{order.dailyNumber}</div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {new Date(order.createdAt).toLocaleString('uz-UZ')}
                                                </p>
                                            </div>
                                            <span className="font-bold text-primary">{order.totalPrice.toLocaleString()} so'm</span>
                                        </div>
                                        <div className="text-sm">
                                            {order.items.map((item, idx) => (
                                                <div key={idx}>{item.menuItem.name} x{item.quantity}</div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
