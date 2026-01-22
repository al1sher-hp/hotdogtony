import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import socket from '../utils/socket';
import { showToast } from '../components/shared/Toast';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FiClock, FiMaximize, FiCheckCircle, FiPlay, FiLogOut } from 'react-icons/fi';

export default function EmployeeDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showScanner, setShowScanner] = useState(false);
    const { logout } = useAuth();

    const fetchOrders = React.useCallback(async () => {
        try {
            const response = await api.get('/orders?status=pending,preparing');
            setOrders(response.data.orders);
        } catch (error) {
            showToast('Buyurtmalarni yuklashda xatolik', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    const onScanSuccess = React.useCallback(async (decodedText) => {
        try {
            const response = await api.post('/orders/verify-qr', { qrData: decodedText });
            showToast(`Buyurtma #${response.data.order.dailyNumber} tasdiqlandi`, 'success');
            setShowScanner(false);
            fetchOrders();
        } catch (error) {
            showToast('QR kod xato yoki allaqachon tasdiqlangan', 'error');
        }
    }, [fetchOrders]);

    const onScanError = React.useCallback((error) => {
        // Ignore scan errors
    }, []);

    const confirmOrder = async (orderId) => {
        try {
            await api.patch(`/orders/${orderId}/confirm`);
            showToast('Tayyorlash boshlandi', 'info');
            fetchOrders();
        } catch (error) {
            showToast('Xatolik yuz berdi', 'error');
        }
    };

    const markReady = async (orderId) => {
        try {
            await api.patch(`/orders/${orderId}/ready`);
            showToast('Buyurtma tayyor!', 'success');
            fetchOrders();
        } catch (error) {
            showToast('Xatolik yuz berdi', 'error');
        }
    };

    useEffect(() => {
        fetchOrders();
        socket.emit('joinEmployee');

        socket.on('newOrder', (order) => {
            setOrders(prev => [order, ...prev]);
            showToast('Yangi buyurtma keldi!', 'info');
            // Play notification sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log('Audio error'));
        });

        return () => {
            socket.off('newOrder');
        };
    }, [fetchOrders]);

    useEffect(() => {
        if (showScanner) {
            const scanner = new Html5QrcodeScanner('qr-reader', {
                fps: 10,
                qrbox: 280,
                videoConstraints: { facingMode: 'environment' }
            });

            scanner.render(onScanSuccess, onScanError);

            return () => {
                scanner.clear();
            };
        }
    }, [showScanner, onScanSuccess, onScanError]);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-[#f0f2f5]">
            <div className="navbar bg-indigo-900 text-white shadow-xl px-6">
                <div className="flex-1">
                    <h1 className="text-xl font-bold flex items-center gap-3">
                        <span className="bg-white/20 p-2 rounded-xl">👨‍🍳</span>
                        Oshxona Paneli
                    </h1>
                </div>
                <div className="flex-none gap-4">
                    <button
                        onClick={() => setShowScanner(!showScanner)}
                        className={`btn btn-sm ${showScanner ? 'btn-error' : 'btn-accent'} rounded-xl gap-2`}
                    >
                        <FiMaximize /> {showScanner ? 'Yopish' : 'Scan QR'}
                    </button>
                    <button onClick={() => logout()} className="btn btn-ghost btn-circle">
                        <FiLogOut size={20} />
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {showScanner && (
                    <div className="card bg-white shadow-2xl mb-8 p-4 rounded-3xl border-4 border-accent">
                        <div id="qr-reader" className="overflow-hidden rounded-2xl"></div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* New Orders Section */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3 px-2">
                            <FiClock className="text-amber-500" />
                            YANGI BUYURTMALAR
                            <span className="badge badge-amber font-bold">{orders.filter(o => o.status === 'pending').length}</span>
                        </h2>

                        <div className="space-y-4">
                            {orders.filter(o => o.status === 'pending').length === 0 ? (
                                <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                    <p className="text-gray-400 font-medium">Hozircha yangi buyurtmalar yo'q</p>
                                </div>
                            ) : (
                                orders.filter(o => o.status === 'pending').map(order => (
                                    <div key={order._id} className="card bg-white shadow-sm hover:shadow-md transition-shadow border-l-8 border-amber-400 rounded-2xl overflow-hidden p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-xs font-black text-amber-600 uppercase">Buyurtma #{order.dailyNumber}</span>
                                                <h3 className="text-xl font-bold text-gray-800">{order.customerName}</h3>
                                            </div>
                                            <span className="text-xs text-gray-400 font-medium">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>

                                        <div className="space-y-2 mb-6">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between bg-gray-50 p-3 rounded-xl">
                                                    <span className="font-bold text-gray-700">{item.menuItem.name}</span>
                                                    <span className="badge badge-neutral font-black">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => confirmOrder(order._id)}
                                            className="btn btn-primary w-full rounded-xl gap-2 font-bold shadow-lg shadow-indigo-100"
                                        >
                                            <FiPlay /> TAYYORLASHNI BOSHLASH
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Preparing Section */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3 px-2">
                            <FiCheckCircle className="text-indigo-500" />
                            TAYYORLANMOQDA
                            <span className="badge badge-primary font-bold">{orders.filter(o => o.status === 'preparing').length}</span>
                        </h2>

                        <div className="space-y-4">
                            {orders.filter(o => o.status === 'preparing').length === 0 ? (
                                <div className="p-12 text-center bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                                    <p className="text-gray-400 font-medium">Tayyorlanayotgan buyurtmalar yo'q</p>
                                </div>
                            ) : (
                                orders.filter(o => o.status === 'preparing').map(order => (
                                    <div key={order._id} className="card bg-white shadow-sm border-l-8 border-indigo-500 rounded-2xl overflow-hidden p-6 animate-pulse-slow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-xs font-black text-indigo-600 uppercase">Buyurtma #{order.dailyNumber}</span>
                                                <h3 className="text-xl font-bold text-gray-800">{order.customerName}</h3>
                                            </div>
                                            <span className="text-xs text-gray-400 font-medium">Tayyorlanmoqda...</span>
                                        </div>

                                        <div className="space-y-2 mb-6">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                                    <span className="font-bold text-indigo-900">{item.menuItem.name}</span>
                                                    <span className="badge badge-primary font-black">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => markReady(order._id)}
                                            className="btn btn-success text-white w-full rounded-xl gap-2 font-bold shadow-lg shadow-green-100"
                                        >
                                            <FiCheckCircle /> TAYYOR BO'LDI
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
