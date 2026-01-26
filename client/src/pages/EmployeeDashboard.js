import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import socket from '../utils/socket';
import { showToast } from '../components/shared/Toast';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { Html5Qrcode } from 'html5-qrcode';
import { FiClock, FiMaximize, FiCheckCircle, FiPlay, FiLogOut, FiRefreshCw } from 'react-icons/fi';

export default function EmployeeDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showScanner, setShowScanner] = useState(false);
    const [scannerInstance, setScannerInstance] = useState(null);
    const { logout } = useAuth();

    const fetchOrders = useCallback(async () => {
        try {
            const response = await api.get('/orders?status=pending,preparing,ready');
            setOrders(response.data.orders);
        } catch (error) {
            showToast('Buyurtmalarni yuklab bo\'lmadi', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    const onScanSuccess = useCallback(async (decodedText) => {
        try {
            const response = await api.post('/orders/verify-qr', { qrData: decodedText });
            showToast(`Buyurtma #${response.data.order.dailyNumber} tasdiqlandi va oshxonaga yuborildi`, 'success');

            // Stop scanner after success
            if (scannerInstance) {
                await scannerInstance.stop();
            }
            setShowScanner(false);
            fetchOrders();
        } catch (error) {
            showToast('QR kod xato yoki allaqachon tasdiqlangan', 'error');
        }
    }, [fetchOrders, scannerInstance]);

    const startScanner = useCallback(async () => {
        try {
            const html5QrCode = new Html5Qrcode("qr-reader");
            setScannerInstance(html5QrCode);

            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            // Attempt to use the back camera (environment)
            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                onScanSuccess
            );
        } catch (err) {
            console.error("Camera start error:", err);
            showToast("Kamerani ishga tushirib bo'lmadi. Kamera ruxsatini tekshiring.", "error");
            setShowScanner(false);
        }
    }, [onScanSuccess]);

    const stopScanner = useCallback(async () => {
        if (scannerInstance && scannerInstance.isScanning) {
            try {
                await scannerInstance.stop();
            } catch (err) {
                console.error("Scanner stop error:", err);
            }
        }
        setShowScanner(false);
    }, [scannerInstance]);

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
            showToast('Buyurtma tayyor! Mijozga xabar berildi', 'success');
            fetchOrders();
        } catch (error) {
            showToast('Xatolik yuz berdi', 'error');
        }
    };

    const markCompleted = async (orderId) => {
        try {
            await api.patch(`/orders/${orderId}`, { status: 'completed' });
            showToast('Buyurtma yakunlandi', 'success');
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
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log('Audio error'));
        });

        socket.on('orderUpdated', () => fetchOrders());
        socket.on('orderReady', () => fetchOrders());

        return () => {
            socket.off('newOrder');
            socket.off('orderUpdated');
            socket.off('orderReady');
        };
    }, [fetchOrders]);

    // Handle scanner UI lifecycle
    useEffect(() => {
        if (showScanner) {
            startScanner();
        } else {
            // Already handled by stopScanner function, 
            // but just in case we close it via other means
        }

        return () => {
            if (scannerInstance && scannerInstance.isScanning) {
                scannerInstance.stop().catch(e => console.log(e));
            }
        };
    }, [showScanner]); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <div className="navbar bg-indigo-950 text-white shadow-2xl px-6 sticky top-0 z-50">
                <div className="flex-1">
                    <h1 className="text-xl font-bold flex items-center gap-3">
                        <span className="bg-white/10 p-2 rounded-2xl">👨‍🍳</span>
                        Oshxona Boshqaruvi
                    </h1>
                </div>
                <div className="flex-none gap-4">
                    <button
                        onClick={() => showScanner ? stopScanner() : setShowScanner(true)}
                        className={`btn btn-sm ${showScanner ? 'btn-error' : 'btn-accent text-indigo-950'} rounded-2xl gap-2 font-bold px-5 shadow-lg`}
                    >
                        <FiMaximize /> {showScanner ? 'Yopish' : 'Scan QR'}
                    </button>
                    <button onClick={() => logout()} className="btn btn-ghost btn-circle hover:bg-white/10 transition-colors">
                        <FiLogOut size={20} />
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 max-w-[1400px]">
                {showScanner && (
                    <div className="card bg-indigo-900 shadow-2xl mb-10 p-6 rounded-[2.5rem] border-8 border-indigo-800 animate-in fade-in zoom-in duration-300 relative overflow-hidden">
                        <div className="absolute top-4 right-4 z-10">
                            <button onClick={() => { stopScanner(); setTimeout(() => setShowScanner(true), 100); }} className="btn btn-circle btn-xs btn-ghost text-white border border-white/20">
                                <FiRefreshCw />
                            </button>
                        </div>
                        <div id="qr-reader" className="overflow-hidden rounded-[1.5rem] bg-black min-h-[300px]"></div>
                        <p className="text-center text-white/50 text-xs mt-4 font-bold tracking-widest uppercase">Kamerani QR kodga qarating</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* New Orders Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                <span className="bg-amber-100 p-2 rounded-xl text-amber-600"><FiClock /></span>
                                KUTILMOQDA
                            </h2>
                            <span className="badge badge-amber font-black h-8 px-4 border-0 shadow-sm text-amber-700 bg-amber-100">{orders.filter(o => o.status === 'pending').length}</span>
                        </div>

                        <div className="space-y-4">
                            {orders.filter(o => o.status === 'pending').length === 0 ? (
                                <EmptyState message="Yangi buyurtmalar yo'q" />
                            ) : (
                                orders.filter(o => o.status === 'pending').map(order => (
                                    <OrderCard
                                        key={order._id}
                                        order={order}
                                        type="pending"
                                        onAction={() => confirmOrder(order._id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Preparing Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                <span className="bg-indigo-100 p-2 rounded-xl text-indigo-600"><FiPlay /></span>
                                TAYYORLANMOQDA
                            </h2>
                            <span className="badge badge-primary font-black h-8 px-4 border-0 shadow-sm text-indigo-700 bg-indigo-100">{orders.filter(o => o.status === 'preparing').length}</span>
                        </div>

                        <div className="space-y-4">
                            {orders.filter(o => o.status === 'preparing').length === 0 ? (
                                <EmptyState message="Hozircha hech narsa yo'q" />
                            ) : (
                                orders.filter(o => o.status === 'preparing').map(order => (
                                    <OrderCard
                                        key={order._id}
                                        order={order}
                                        type="preparing"
                                        onAction={() => markReady(order._id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Ready Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                <span className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><FiCheckCircle /></span>
                                TAYYOR BUYURTMALAR
                            </h2>
                            <span className="badge badge-success font-black h-8 px-4 border-0 shadow-sm text-emerald-700 bg-emerald-100">{orders.filter(o => o.status === 'ready').length}</span>
                        </div>

                        <div className="space-y-4">
                            {orders.filter(o => o.status === 'ready').length === 0 ? (
                                <EmptyState message="Tayyor buyurtmalar yo'q" />
                            ) : (
                                orders.filter(o => o.status === 'ready').map(order => (
                                    <OrderCard
                                        key={order._id}
                                        order={order}
                                        type="ready"
                                        onAction={() => markCompleted(order._id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const EmptyState = ({ message }) => (
    <div className="p-12 text-center bg-white/40 rounded-[2rem] border-2 border-dashed border-slate-200">
        <p className="text-slate-400 font-bold italic">{message}</p>
    </div>
);

const OrderCard = ({ order, type, onAction }) => (
    <div className={`card bg-white shadow-sm hover:shadow-xl transition-all duration-300 border-l-[10px] ${type === 'pending' ? 'border-amber-400' :
            type === 'preparing' ? 'border-indigo-500' : 'border-emerald-500'
        } rounded-3xl overflow-hidden p-6 animate-in fade-in slide-in-from-bottom-2`}>
        <div className="flex justify-between items-start mb-5">
            <div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${type === 'pending' ? 'bg-amber-100 text-amber-700' :
                        type === 'preparing' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>Buyurtma #{order.dailyNumber}</span>
                <h3 className="text-xl font-black text-slate-800 mt-1 uppercase tracking-tighter">{order.customerName}</h3>
            </div>
            <div className="text-right">
                <span className="text-[10px] text-slate-400 font-black uppercase block">Kelgan vaqti:</span>
                <span className="text-xs text-slate-600 font-bold">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        </div>

        <div className="space-y-2 mb-8">
            {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl group border border-slate-100 hover:bg-white hover:border-slate-200 transition-all">
                    <span className="font-bold text-slate-700">{item.menuItem.name}</span>
                    <span className="badge bg-slate-900 border-0 h-6 w-6 p-0 text-[10px] font-black text-white rounded-lg">x{item.quantity}</span>
                </div>
            ))}
        </div>

        <button
            onClick={onAction}
            className={`btn w-full h-14 rounded-2xl gap-3 font-black border-0 shadow-lg text-sm tracking-tighter transition-all ${type === 'pending' ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200' :
                    type === 'preparing' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200' :
                        'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                }`}
        >
            {type === 'pending' && <><FiPlay /> TAYYORLASHNI BOSHLASH</>}
            {type === 'preparing' && <><FiCheckCircle /> TAYYOR BO'LDI</>}
            {type === 'ready' && <><FiCheckCircle /> TOPSHIRILDI</>}
        </button>
    </div>
);
