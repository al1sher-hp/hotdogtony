import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { showToast } from '../components/shared/Toast';

export default function BossLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.token, response.data.user);
            showToast('Xush kelibsiz, Boshliq!', 'success');
            navigate('/boss/dashboard');
        } catch (error) {
            showToast(error.response?.data?.error || 'Login xato', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <div className="card w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/5 p-12 rounded-[3.5rem] shadow-5xl animate-in fade-in duration-700">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20 -rotate-3 group hover:rotate-0 transition-all duration-500">
                        <span className="text-4xl">👔</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Boshliq</h1>
                    <p className="text-white/40 font-bold tracking-[0.2em] text-[10px] uppercase">Marketing va Statistika</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Email</label>
                        <input
                            type="email"
                            placeholder="boss@hotdog.uz"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input input-bordered w-full h-16 rounded-2xl bg-white/5 border-0 focus:ring-2 focus:ring-indigo-500 font-bold px-6 text-white text-lg"
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
                            className="input input-bordered w-full h-16 rounded-2xl bg-white/5 border-0 focus:ring-2 focus:ring-indigo-500 font-bold px-6 text-white text-lg"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 border-0 w-full h-16 rounded-2xl font-black text-lg text-white shadow-2xl shadow-indigo-500/30 mt-4 uppercase tracking-tight group">
                        {loading ? <span className="loading loading-spinner"></span> : 'Boshqaruvga Kirish'}
                    </button>
                </form>
            </div>
        </div>
    );
}
