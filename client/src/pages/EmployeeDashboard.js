import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import socket from '../utils/socket';
import { showToast } from '../components/shared/Toast';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FiCheckCircle, FiClock } from 'react-icons/fi';

export default function EmployeeDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showScanner, setShowScanner] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
        socket.emit('joinEmployee');

        socket.on('newOrder', (order) => {
            setOrders(prev => [order, ...prev]);
            showToast('Yangi buyurtma!', 'info');
        });

        return () => {
            socket.off('newOrder');
        };
    }, []);

    useEffect(() => {
        if (showScanner) {
            const scanner = new Html5QrcodeScanner('qr-reader', {
                fps: 10,
                qrbox: 250,
                videoConstraints: { facingMode: 'environment' }
            });

            scanner.render(onScanSuccess, onScanError);

            return () => {
                scanner.clear();
            };
        }
    }, [showScanner]);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders?status=pending,preparing');
            setOrders(response.data.orders);
        } catch (error) {
            showToast('Xatolik', 'error');
        } finally {
            setLoading(false);
        }
    };

    const onScanSuccess = async (decodedText) => {
        try {
            const response = await api.post('/orders/verify-qr', { qrData: decodedText });
            showToast(`Buyurtma #${response.data.order.dailyNumber} tasdiqlandi`, 'success');
            setShowScanner(false);
            fetchOrders();
        } catch (error) {
            showToast('QR kod xato', 'error');
        }
    };

    const onScanError = (error) => {
        // Ignore scan errors
    };

    const confirmOrder = async (orderId) => {
        try {
            await api.patch(`/orders/${orderId}/confirm`);
            showToast('Buyurtma tasdiqlandi', 'success');
            fetchOrders();
        } catch (error) {
            showToast('Xatolik', 'error');
        }
    };

    const markReady = async (orderId) => {
        try {
            await api.patch(`/orders/${orderId}/ready`);
            showToast('Buyurtma tayyor!', 'success');
            fetchOrders();
        } catch (error) {
            showToast('Xatolik', 'error');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-base-200">
            <div className="navbar bg-primary text-white">
                <h1 className="flex-1 text-2xl font-bold">Hodim Paneli</h1>
                <button onClick={() => logout()} className="btn btn-ghost">Chiqish</button>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <button onClick={() => setShowScanner(!showScanner)} className="btn btn-secondary">
                        {showScanner ? 'Yopish' : 'QR Skanerlash'}
                    </button>
                </div>

                {showScanner && (
                    <div className="card bg-base-100 shadow-xl mb-6">
                        <div className="card-body">
                            <div id="qr-reader"></div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pending Orders */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-warning"><FiClock /> Kutilmoqda</h2>
                            <div className="space-y-4">
                                {orders.filter(o => o.status === 'pending').map(order => (
                                    <div key={order._id} className="bg-warning bg-opacity-10 p-4 rounded-lg">
                                        <div className="font-bold text-lg mb-2">#{order.dailyNumber} - {order.customerName}</div>
                                        <div className="text-sm mb-3">
                                            {order.items.map((item, idx) => (
                                                <div key={idx}>{item.menuItem.name} x{item.quantity}</div>
                                            ))}
                                        </div>
                                        <button onClick={() => confirmOrder(order._id)} className="btn btn-primary btn-sm">
                                            Tasdiqlash
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Preparing Orders */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-primary">Tayyorlanmoqda</h2>
                            <div className="space-y-4">
                                {orders.filter(o => o.status === 'preparing').map(order => (
                                    <div key={order._id} className="bg-primary bg-opacity-10 p-4 rounded-lg">
                                        <div className="font-bold text-lg mb-2">#{order.dailyNumber} - {order.customerName}</div>
                                        <div className="text-sm mb-3">
                                            {order.items.map((item, idx) => (
                                                <div key={idx}>{item.menuItem.name} x{item.quantity}</div>
                                            ))}
                                        </div>
                                        <button onClick={() => markReady(order._id)} className="btn btn-success btn-sm">
                                            Tayyor
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
