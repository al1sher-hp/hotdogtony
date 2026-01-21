import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { showToast } from '../components/shared/Toast';

export default function EmployeeLogin() {
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
            showToast('Xush kelibsiz!', 'success');
            navigate('/employee/dashboard');
        } catch (error) {
            showToast(error.response?.data?.error || 'Login xato', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen section-gradient flex items-center justify-center p-4">
            <div className="glass-card p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-white text-center mb-8">Hodim Paneli</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="input-modern"
                    />
                    <input
                        type="password"
                        placeholder="Parol"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="input-modern"
                    />
                    <button type="submit" disabled={loading} className="btn-gradient w-full">
                        {loading ? 'Kirilmoqda...' : 'Kirish'}
                    </button>
                </form>
            </div>
        </div>
    );
}
