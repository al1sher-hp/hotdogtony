import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import socket from '../utils/socket';
import { showToast } from '../components/shared/Toast';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { Html5Qrcode } from 'html5-qrcode';
import { FiMaximize, FiCheckCircle, FiPlay, FiLogOut, FiX } from 'react-icons/fi';

export default function EmployeeDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showScanner, setShowScanner] = useState(false);
    const [scannerInstance, setScannerInstance] = useState(null);
    const isProcessingRef = React.useRef(false);
    const { logout } = useAuth();

    const fetchOrders = useCallback(async () => {
        try {
            const response = await api.get('/orders?status=preparing,ready');
            setOrders(response.data.orders);
        } catch (error) {
            showToast('Buyurtmalarni yuklab bo\'lmadi', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    const onScanSuccess = useCallback(async (decodedText) => {
        // SYNCHRONOUS LOCK: isProcessingRef changes instantly
        if (isProcessingRef.current) return;

        isProcessingRef.current = true;
        try {
            const response = await api.post('/orders/verify-qr', { qrData: decodedText });
            showToast(`Buyurtma #${response.data.order.dailyNumber} TASDIQLANDI`, 'success');

            // Stop scanner after success
            if (scannerInstance) {
                try { await scannerInstance.stop(); } catch (e) { }
            }
            setShowScanner(false);
            fetchOrders();
        } catch (error) {
            // Only show toast if it's not a common "already processed" error
            // to avoid duplicates even in error state
            showToast(error.response?.data?.error || 'QR kod xato', 'error');

            // Give 2 seconds before allowing next scan if error occurs
            setTimeout(() => {
                isProcessingRef.current = false;
            }, 2000);
        }
    }, [fetchOrders, scannerInstance]);

    const startScanner = useCallback(async () => {
        try {
            const html5QrCode = new Html5Qrcode("qr-reader");
            setScannerInstance(html5QrCode);

            const config = { fps: 15, qrbox: { width: 250, height: 250 } };

            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                onScanSuccess
            );
        } catch (err) {
            console.error("Camera start error:", err);
            showToast("Kamerani ishga tushirib bo'lmadi.", "error");
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

    const markReady = async (orderId) => {
        try {
            await api.patch(`/orders/${orderId}/ready`);
            showToast('Tayyor!', 'success');
            fetchOrders();
        } catch (error) {
            showToast('Xatolik yuz berdi', 'error');
        }
    };

    const markCompleted = async (orderId) => {
        try {
            await api.patch(`/orders/${orderId}/complete`);
            showToast('Topshirildi', 'success');
            fetchOrders();
        } catch (error) {
            showToast('Xatolik yuz berdi', 'error');
        }
    };

    useEffect(() => {
        fetchOrders();
        socket.emit('joinEmployee');

        // Note: We no longer listen to 'newOrder' since they are silent now
        // We only listen for updates (like when something is scanned or moved)
        socket.on('orderUpdated', () => fetchOrders());
        socket.on('orderReady', () => fetchOrders());

        return () => {
            socket.off('orderUpdated');
            socket.off('orderReady');
        };
    }, [fetchOrders]);

    // Handle scanner UI lifecycle
    useEffect(() => {
        if (showScanner) {
            startScanner();
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
            <nav className="navbar bg-slate-900 text-white shadow-2xl px-6 sticky top-0 z-50">
                <div className="flex-1">
                    <h1 className="text-xl font-black flex items-center gap-3 tracking-tighter">
                        <span className="bg-red-600 p-2 rounded-xl"><FiMaximize /></span>
                        HODIM PANELI
                    </h1>
                </div>
                <div className="flex-none gap-4">
                    <button
                        onClick={() => showScanner ? stopScanner() : setShowScanner(true)}
                        className={`btn btn-md ${showScanner ? 'btn-error' : 'btn-success text-white'} rounded-2xl gap-2 font-bold px-8 shadow-xl shadow-green-500/20`}
                    >
                        {showScanner ? <><FiX /> Yopish</> : <><FiMaximize /> QR SCAN</>}
                    </button>
                    <button onClick={() => logout()} className="btn btn-ghost btn-circle">
                        <FiLogOut size={20} />
                    </button>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {showScanner && (
                    <div className="card bg-slate-900 border-8 border-slate-800 shadow-2xl mb-12 p-6 rounded-[3rem] animate-in zoom-in duration-300 relative overflow-hidden max-w-lg mx-auto">
                        <div id="qr-reader" className="overflow-hidden rounded-2xl bg-black min-h-[350px]"></div>
                        <p className="text-center text-white/40 text-[10px] mt-4 font-black tracking-widest uppercase">Mijoz QR kodini kameraga qarating</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                    {/* Preparing Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-tighter">
                                <span className="text-blue-600"><FiPlay /></span>
                                Tayyorlanmoqda
                            </h2>
                            <span className="badge badge-lg bg-blue-100 border-0 text-blue-700 font-black">{orders.filter(o => o.status === 'preparing').length}</span>
                        </div>

                        <div className="space-y-4">
                            {orders.filter(o => o.status === 'preparing').length === 0 ? (
                                <EmptyState message="Tayyorlanayotgan buyurtmalar yo'q. Yangi buyurtma olish uchun QR kodni skanerlang." />
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
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-tighter">
                                <span className="text-emerald-600"><FiCheckCircle /></span>
                                Tayyor
                            </h2>
                            <span className="badge badge-lg bg-emerald-100 border-0 text-emerald-700 font-black">{orders.filter(o => o.status === 'ready').length}</span>
                        </div>

                        <div className="space-y-4">
                            {orders.filter(o => o.status === 'ready').length === 0 ? (
                                <EmptyState message="Hozircha tayyor buyurtmalar yo'q." />
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
