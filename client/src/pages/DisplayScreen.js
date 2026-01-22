import React, { useState, useEffect, useRef } from 'react';
import socket from '../utils/socket';
import api from '../utils/api';

export default function DisplayScreen() {
    const [preparing, setPreparing] = useState([]);
    const [ready, setReady] = useState([]);
    const audioRef = useRef(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const prepResp = await api.get('/orders?status=preparing');
                setPreparing(prepResp.data.orders);

                const readyResp = await api.get('/orders?status=ready');
                setReady(readyResp.data.orders);
            } catch (error) {
                console.error('Fetch error:', error);
            }
        };

        const playSound = () => {
            if (audioRef.current) {
                audioRef.current.play().catch(e => console.log('Audio error'));
            }
        };

        fetchOrders();
        socket.emit('joinDisplay');

        socket.on('orderUpdated', (order) => {
            if (order.status === 'preparing') {
                setPreparing(prev => [order, ...prev.filter(o => o._id !== order._id)]);
                setReady(prev => prev.filter(o => o._id !== order._id));
            } else if (order.status === 'completed' || order.status === 'ready') {
                // handled by orderReady or just general cleanup
                setPreparing(prev => prev.filter(o => o._id !== order._id));
            }
        });

        socket.on('orderReady', (order) => {
            setPreparing(prev => prev.filter(o => o._id !== order._id));
            setReady(prev => [order, ...prev.filter(o => o._id !== order._id)]);
            playSound();

            // Remove from ready after 5 minutes
            setTimeout(() => {
                setReady(prev => prev.filter(o => o._id !== order._id));
            }, 300000);
        });

        return () => {
            socket.off('orderUpdated');
            socket.off('orderReady');
        };
    }, []);

    return (
        <div className="min-h-screen bg-neutral-900 overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-indigo-700 py-6 shadow-2xl relative z-10">
                <h1 className="text-5xl md:text-7xl font-black text-white text-center tracking-tighter italic">
                    🌭 HOTDOG SHAHOBCHA
                </h1>
            </div>

            <div className="flex h-[calc(100vh-120px)]">
                {/* Tayyorlanmoqda Column */}
                <div className="w-1/2 p-8 border-r-4 border-neutral-800">
                    <h2 className="text-4xl font-black text-amber-500 mb-10 text-center flex items-center justify-center gap-4">
                        <span className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center animate-spin-slow">⏳</span>
                        TAYYORLANMOQDA
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        {preparing.map(order => (
                            <div key={order._id} className="bg-neutral-800/50 p-8 rounded-[2rem] text-center border-2 border-amber-500/30 animate-pulse-slow">
                                <div className="text-7xl font-black text-amber-400">{order.dailyNumber}</div>
                                <div className="text-2xl font-bold text-gray-400 mt-2 truncate px-2">{order.customerName}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tayyor Column */}
                <div className="w-1/2 p-8 bg-green-500/5">
                    <h2 className="text-4xl font-black text-green-500 mb-10 text-center flex items-center justify-center gap-4">
                        <span className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">✅</span>
                        TAYYOR
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        {ready.map(order => (
                            <div key={order._id} className="bg-green-500 p-8 rounded-[2rem] text-center shadow-[0_0_50px_rgba(34,197,94,0.3)] animate-bounce-short">
                                <div className="text-8xl font-black text-white">{order.dailyNumber}</div>
                                <div className="text-2xl font-bold text-green-100 mt-2 truncate px-2">{order.customerName}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer / Scrolling Text */}
            <div className="bg-neutral-800 py-3 absolute bottom-0 w-full overflow-hidden">
                <div className="animate-marquee whitespace-nowrap text-amber-500/50 font-bold text-xl">
                    Yoqimli ishtaha! • Har kuni 10:00 dan 22:00 gacha xizmatingizdamiz • Sifat kafolatlangan • Hotdog Shahobcha •
                </div>
            </div>

            {/* Sound Notification */}
            <audio ref={audioRef}>
                <source src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" type="audio/wav" />
            </audio>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .animate-bounce-short {
                    animation: bounce 1s ease-in-out infinite;
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-spin-slow {
                    animation: spin 3s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
