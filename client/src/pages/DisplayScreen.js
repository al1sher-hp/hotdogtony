import React, { useState, useEffect, useRef } from 'react';
import { subscribeDisplayOrders } from '../utils/firestore';
import { FiClock, FiCheckCircle, FiBell } from 'react-icons/fi';

export default function DisplayScreen() {
    const [preparing, setPreparing] = useState([]);
    const [ready, setReady] = useState([]);
    const audioRef = useRef(null);
    const prevReadyIds = useRef(new Set());

    useEffect(() => {
        const playSound = () => {
            if (audioRef.current) {
                audioRef.current.play().catch(e => console.log('Audio play prevented'));
            }
        };

        // Firestore real-time subscription — Socket.io o'rniga
        const unsubscribe = subscribeDisplayOrders(({ preparing: prep, ready: rdy }) => {
            setPreparing(prep);

            // Yangi tayyor buyurtmalar uchun ovoz chalish
            rdy.forEach(order => {
                if (!prevReadyIds.current.has(order.id)) {
                    playSound();
                }
            });
            prevReadyIds.current = new Set(rdy.map(o => o.id));

            // Ready buyurtmalarni 5 daqiqadan keyin olib tashlash
            setReady(rdy.filter(order => {
                if (!order.readyAt) return true;
                const readyTime = order.readyAt?.toDate ? order.readyAt.toDate() : new Date(order.readyAt);
                return (Date.now() - readyTime.getTime()) < 5 * 60 * 1000;
            }));
        });

        // Ready buyurtmalarni 1 daqiqada bir tozalash
        const cleanupInterval = setInterval(() => {
            setReady(prev => prev.filter(order => {
                if (!order.readyAt) return true;
                const readyTime = order.readyAt?.toDate ? order.readyAt.toDate() : new Date(order.readyAt);
                return (Date.now() - readyTime.getTime()) < 5 * 60 * 1000;
            }));
        }, 60000);

        return () => {
            unsubscribe();
            clearInterval(cleanupInterval);
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-100 font-sans overflow-hidden flex flex-col selection:bg-primary selection:text-white">
            {/* Header Area */}
            <header className="bg-[#111114] border-b border-white/5 py-8 px-12 flex justify-between items-center shadow-2xl relative z-10">
                <div className="flex items-center gap-6">
                    <div className="bg-gradient-to-br from-primary to-secondary p-4 rounded-[2rem] shadow-2xl shadow-primary/20 rotate-3">
                        <FiStar size={40} className="text-white mx-auto mb-2 drop-shadow-lg" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase text-white leading-none">Hotdog Tony</h1>
                        <p className="text-primary font-black uppercase tracking-[0.3em] text-xs mt-2 opacity-80">Buyurtmalar Monitori</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/5 px-8 py-4 rounded-3xl border border-white/5 backdrop-blur-md">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                    <span className="text-sm font-black uppercase tracking-widest text-white/50">Jonli Yangilanish</span>
                </div>
            </header>

            {/* Main Content Grid */}
            <main className="flex-1 flex overflow-hidden">
                {/* PREPARING COLUMN */}
                <section className="flex-1 flex flex-col border-r border-white/5 bg-[#0d0d0f]/50">
                    <div className="p-10 flex items-center justify-between border-b border-white/5">
                        <h2 className="text-3xl font-black flex items-center gap-4 text-amber-500 uppercase tracking-tight">
                            <div className="p-3 bg-amber-500/10 rounded-2xl animate-spin-slow"><FiClock size={28} /></div>
                            Tayyorlanmoqda
                        </h2>
                        <span className="px-6 py-2 bg-amber-500 text-black font-black rounded-2xl text-xl shadow-xl shadow-amber-500/20">{preparing.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {preparing.map(order => (
                                <div key={order._id} className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 flex items-center gap-8 animate-in fade-in slide-in-from-left-8 duration-500 hover:bg-white/10 transition-all group">
                                    <div className="text-6xl font-black text-amber-500/50 tracking-tighter group-hover:text-amber-500 group-hover:scale-110 transition-all">{order.dailyNumber}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-2xl font-black text-white uppercase truncate tracking-tight">{order.customerName}</div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mt-1">Jarayonda...</div>
                                    </div>
                                </div>
                            ))}
                            {preparing.length === 0 && (
                                <div className="col-span-full py-32 text-center opacity-10">
                                    <FiClock size={80} className="mx-auto mb-6" />
                                    <p className="text-2xl font-black uppercase tracking-widest italic">Hozircha buyurtma yo'q</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* READY COLUMN */}
                <section className="flex-1 flex flex-col bg-green-500/[0.02]">
                    <div className="p-10 flex items-center justify-between border-b border-white/5 bg-green-500/[0.03]">
                        <h2 className="text-3xl font-black flex items-center gap-4 text-green-500 uppercase tracking-tight">
                            <div className="p-3 bg-green-500/10 rounded-2xl animate-bounce-slow"><FiCheckCircle size={28} /></div>
                            Tayyor!
                        </h2>
                        <span className="px-6 py-2 bg-green-500 text-white font-black rounded-2xl text-xl shadow-xl shadow-green-500/20">{ready.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {ready.map(order => (
                                <div key={order._id} className="bg-green-500 border-0 rounded-[3rem] p-10 flex items-center gap-8 animate-in zoom-in duration-500 shadow-2xl shadow-green-500/20 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-150 transition-transform"><FiBell size={80} /></div>
                                    <div className="text-8xl font-black text-white tracking-tighter drop-shadow-2xl relative z-10">{order.dailyNumber}</div>
                                    <div className="flex-1 min-w-0 relative z-10">
                                        <div className="text-3xl font-black text-white uppercase truncate tracking-tight">{order.customerName}</div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mt-2">MARHAMAT, QABUL QILING!</div>
                                    </div>
                                </div>
                            ))}
                            {ready.length === 0 && (
                                <div className="col-span-full py-32 text-center opacity-10">
                                    <FiCheckCircle size={80} className="mx-auto mb-6" />
                                    <p className="text-2xl font-black uppercase tracking-widest italic">Tayyor buyurtmalar yo'q</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer Marquee */}
            <footer className="bg-[#111114] border-t border-white/5 py-6 overflow-hidden">
                <div className="flex animate-marquee whitespace-nowrap">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center">
                            <span className="text-2xl font-black text-white/20 uppercase tracking-[0.3em] mx-20">Yoqimli ishtaha!</span>
                            <FiStar size={32} className="text-primary mb-4" />
                            <span className="text-2xl font-black text-white/20 uppercase tracking-[0.3em] mx-20">Sifat kafolatlangan</span>
                            <FiStar size={32} className="text-secondary mb-4" />
                            <span className="text-2xl font-black text-white/20 uppercase tracking-[0.3em] mx-20">Hotdog Tony - Eng yaxshisi</span>
                            <FiStar size={32} className="text-primary mb-4" />
                        </div>
                    ))}
                </div>
            </footer>

            <audio ref={audioRef} preload="auto">
                <source src="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3" type="audio/mpeg" />
            </audio>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-spin-slow { animation: spin-slow 8s linear infinite; }
                .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
                .animate-marquee { animation: marquee 40s linear infinite; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
            `}</style>
        </div>
    );
}
