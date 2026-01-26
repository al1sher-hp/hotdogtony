import React, { useState, useEffect, useRef } from 'react';
import socket from '../utils/socket';
import api from '../utils/api';

export default function DisplayScreen() {
    const [preparing, setPreparing] = useState([]);
    const [ready, setReady] = useState([]);
    const audioRef = useRef(null);

    useEffect(() => {
        // Connect socket for display
        socket.connect();
        socket.emit('joinDisplay');

        const fetchOrders = async () => {
            try {
                // Use public display endpoint (no auth required)
                const response = await api.get('/orders/display');
                setPreparing(response.data.preparing || []);
                setReady(response.data.ready || []);
            } catch (error) {
                console.error('Fetch error:', error);
            }
        };

        const playSound = () => {
            if (audioRef.current) {
                audioRef.current.play().catch(e => console.log('Audio play prevented'));
            }
        };

        fetchOrders();

        // Listen for real-time updates
        socket.on('orderUpdated', (order) => {
            if (order.status === 'preparing') {
                setPreparing(prev => [order, ...prev.filter(o => o._id !== order._id)]);
                setReady(prev => prev.filter(o => o._id !== order._id));
            } else if (order.status === 'completed' || order.status === 'cancelled') {
                setPreparing(prev => prev.filter(o => o._id !== order._id));
                setReady(prev => prev.filter(o => o._id !== order._id));
            }
        });

        socket.on('orderReady', (order) => {
            setPreparing(prev => prev.filter(o => o._id !== order._id));
            setReady(prev => [order, ...prev.filter(o => o._id !== order._id)]);
            playSound();

            // Remove from ready after 60 seconds
            setTimeout(() => {
                setReady(prev => prev.filter(o => o._id !== order._id));
            }, 60000);
        });

        socket.on('newOrder', (order) => {
            // New orders start as pending, will appear when confirmed
        });

        return () => {
            socket.off('orderUpdated');
            socket.off('orderReady');
            socket.off('newOrder');
        };
    }, []);

    return (
        <div className="display-screen">
            {/* Header */}
            <div className="display-header">
                <h1>🌭 HOTDOG SHAHOBCHA</h1>
            </div>

            <div className="display-content">
                {/* Tayyorlanmoqda Column */}
                <div className="display-column preparing-column">
                    <h2 className="column-title preparing-title">
                        <span className="icon-spin">⏳</span>
                        TAYYORLANMOQDA
                    </h2>
                    <div className="orders-grid">
                        {preparing.map(order => (
                            <div key={order._id} className="order-card preparing-card">
                                <div className="order-number">{order.dailyNumber}</div>
                                <div className="order-name">{order.customerName}</div>
                            </div>
                        ))}
                        {preparing.length === 0 && (
                            <div className="empty-message">Hozircha buyurtma yo'q</div>
                        )}
                    </div>
                </div>

                {/* Tayyor Column */}
                <div className="display-column ready-column">
                    <h2 className="column-title ready-title">
                        <span>✅</span>
                        TAYYOR
                    </h2>
                    <div className="orders-grid">
                        {ready.map(order => (
                            <div key={order._id} className="order-card ready-card">
                                <div className="order-number">{order.dailyNumber}</div>
                                <div className="order-name">{order.customerName}</div>
                            </div>
                        ))}
                        {ready.length === 0 && (
                            <div className="empty-message">Tayyor buyurtmalar yo'q</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer / Scrolling Text */}
            <div className="display-footer">
                <div className="marquee-text">
                    Yoqimli ishtaha! • Har kuni 10:00 dan 22:00 gacha xizmatingizdamiz • Sifat kafolatlangan • Hotdog Shahobcha •
                </div>
            </div>

            {/* Sound Notification */}
            <audio ref={audioRef} preload="auto">
                <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdHuOi4Zpb3d6fn6CfYWChHp4eHqDfXuBgXqChXuFgH2Bfn+EgH+FgoBzdn+EgYJ/fYKCfnuAfYODe4CAfX2Af4KBgoCBgYJ+fn+DgYKAfX6Bg4OCf36Af4GBgH6BgYGBgH+AgYGBgH+AgYGBgH+AgYGBgH+AgYGBgH+AgYGBgA==" type="audio/wav" />
            </audio>

            <style>{`
                .display-screen {
                    min-height: 100vh;
                    background: #171717;
                    overflow: hidden;
                    font-family: system-ui, -apple-system, sans-serif;
                    display: flex;
                    flex-direction: column;
                }
                .display-header {
                    background: linear-gradient(135deg, #4338ca, #6366f1);
                    padding: 1.5rem;
                    text-align: center;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                }
                .display-header h1 {
                    color: white;
                    font-size: 3rem;
                    font-weight: 900;
                    margin: 0;
                    letter-spacing: -2px;
                }
                .display-content {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }
                .display-column {
                    flex: 1;
                    padding: 2rem;
                    overflow-y: auto;
                }
                .preparing-column {
                    border-right: 4px solid #262626;
                }
                .ready-column {
                    background: rgba(34, 197, 94, 0.05);
                }
                .column-title {
                    font-size: 2rem;
                    font-weight: 900;
                    text-align: center;
                    margin-bottom: 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                }
                .preparing-title {
                    color: #f59e0b;
                }
                .ready-title {
                    color: #22c55e;
                }
                .icon-spin {
                    display: inline-block;
                    animation: spin 3s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .orders-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.5rem;
                }
                .order-card {
                    padding: 2rem;
                    border-radius: 1.5rem;
                    text-align: center;
                }
                .preparing-card {
                    background: rgba(245, 158, 11, 0.1);
                    border: 2px solid rgba(245, 158, 11, 0.3);
                    animation: pulse 2s ease-in-out infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                .ready-card {
                    background: #22c55e;
                    box-shadow: 0 0 30px rgba(34, 197, 94, 0.3);
                    animation: bounce 1s ease-in-out infinite;
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .order-number {
                    font-size: 4rem;
                    font-weight: 900;
                }
                .preparing-card .order-number {
                    color: #f59e0b;
                }
                .ready-card .order-number {
                    color: white;
                }
                .order-name {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-top: 0.5rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .preparing-card .order-name {
                    color: #9ca3af;
                }
                .ready-card .order-name {
                    color: rgba(255, 255, 255, 0.9);
                }
                .empty-message {
                    grid-column: 1 / -1;
                    text-align: center;
                    color: #6b7280;
                    font-size: 1.25rem;
                    padding: 2rem;
                }
                .display-footer {
                    background: #262626;
                    padding: 0.75rem 0;
                    overflow: hidden;
                    position: relative;
                }
                .marquee-text {
                    color: rgba(245, 158, 11, 0.5);
                    font-weight: 600;
                    font-size: 1.125rem;
                    white-space: nowrap;
                    animation: marquee 30s linear infinite;
                }
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                @media (max-width: 768px) {
                    .display-header h1 { font-size: 1.5rem; }
                    .column-title { font-size: 1.25rem; }
                    .orders-grid { grid-template-columns: 1fr; gap: 1rem; }
                    .order-number { font-size: 2.5rem; }
                    .order-card { padding: 1rem; }
                }
            `}</style>
        </div>
    );
}
