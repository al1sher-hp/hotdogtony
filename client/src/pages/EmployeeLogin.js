import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../components/shared/Toast';

export default function EmployeeLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginWithEmail } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await loginWithEmail(email, password);
            // AuthContext onAuthStateChanged Firestore'dan rolni yuklab, user'ni set qiladi
            // Role check keyin App.js tomonidan bajariladi
            showToast('Xush kelibsiz!', 'success');
            navigate('/employee/dashboard');
        } catch (error) {
            const msg = error.code === 'auth/invalid-credential'
                ? 'Email yoki parol noto\'g\'ri'
                : error.message;
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="card w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/5 p-12 rounded-[3.5rem] shadow-5xl animate-in fade-in duration-700">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20 rotate-12 group hover:rotate-0 transition-all duration-500">
                        <span className="text-4xl">👨‍🍳</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Hodim</h1>
                    <p className="text-white/40 font-bold tracking-[0.2em] text-[10px] uppercase">Oshxona va Buyurtmalar</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Login (Email)</label>
                        <input
                            type="email"
                            placeholder="oshpaz@hotdog.uz"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input input-bordered w-full h-16 rounded-2xl bg-white/5 border-0 focus:ring-2 focus:ring-emerald-500 font-bold px-6 text-white text-lg"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Parol</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="input input-bordered w-full h-16 rounded-2xl bg-white/5 border-0 focus:ring-2 focus:ring-emerald-500 font-bold px-6 text-white text-lg"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 border-0 w-full h-16 rounded-2xl font-black text-lg text-white shadow-2xl shadow-emerald-500/30 mt-4 uppercase tracking-tight group">
                        {loading ? <span className="loading loading-spinner"></span> : 'Ishni Boshlash'}
                    </button>
                </form>
            </div>
        </div>
    );
}
