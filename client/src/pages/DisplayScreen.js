import React, { useState, useEffect, useRef } from 'react';
import socket from '../utils/socket';
import api from '../utils/api';

export default function DisplayScreen() {
    const [preparing, setPreparing] = useState([]);
    const [ready, setReady] = useState([]);
    const audioRef = useRef(null);

    useEffect(() => {
        fetchOrders();
        socket.emit('joinDisplay');

        socket.on('orderUpdated', (order) => {
            if (order.status === 'preparing') {
                setPreparing(prev => [order, ...prev.filter(o => o._id !== order._id)]);
                setReady(prev => prev.filter(o => o._id !== order._id));
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
            audioRef.current.play();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary to-secondary p-8">
            <h1 className="text-6xl font-bold text-white text-center mb-12">🌭 Hotdog Shahobcha</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tayyorlanmoqda */}
                <div>
                    <h2 className="text-4xl font-bold text-yellow-300 mb-6 text-center">⏳ Tayyorlanmoqda</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {preparing.map(order => (
                            <div key={order._id} className="bg-yellow-400 bg-opacity-90 p-6 rounded-2xl text-center animate-pulse-slow">
                                <div className="text-5xl font-bold text-neutral">{order.dailyNumber}</div>
                                <div className="text-2xl font-semibold text-neutral mt-2">{order.customerName}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tayyor */}
                <div>
                    <h2 className="text-4xl font-bold text-green-300 mb-6 text-center">✅ TAyyor</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {ready.map(order => (
                            <div key={order._id} className="bg-green-400 bg-opacity-90 p-6 rounded-2xl text-center animate-glow">
                                <div className="text-5xl font-bold text-neutral">{order.dailyNumber}</div>
                                <div className="text-2xl font-semibold text-neutral mt-2">{order.customerName}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sound */}
            <audio ref={audioRef}>
                <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrKp8ZV1fYHBecGtubm1qaWZlZWRjZ2plZmVkY2BfYGFhYGBfX19fXl5fX15eXl5eXl1dXV1dXV1dXV1cXFxcXFxcXFxbW1tbW1tbW1tbW1tbW1paWlpaWlpaWlpaWVlZWVlZWVlZWFhYWFhYWFhYV1dXV1dXV1dXVlZWVlZWVlZWVVVVVVVVVVVVVFRUVFRUVA==" type="audio/wav" />
            </audio>
        </div>
    );
}
