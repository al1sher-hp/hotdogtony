import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { showToast } from '../components/shared/Toast';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

export default function BossDashboard() {
    const [stats, setStats] = useState(null);
    const [period, setPeriod] = useState('daily');
    const [activeTab, setActiveTab] = useState('stats');
    const [loading, setLoading] = useState(true);
    const { logout } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get(`/reports/stats?period=${period}`);
                setStats(response.data);
            } catch (error) {
                showToast('Statistika yuklanmadi', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [period]);

    const exportToExcel = async () => {
        try {
            const response = await api.get(`/reports/export?period=${period}&type=orders`);
            const ws = XLSX.utils.json_to_sheet(response.data.exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Orders');
            XLSX.writeFile(wb, `orders-${period}-${Date.now()}.xlsx`);
            showToast('Excel yuklab olindi', 'success');
        } catch (error) {
            showToast('Export xato', 'error');
        }
    };

    if (loading) return <LoadingSpinner />;

    const chartData = {
        labels: stats?.hourlyOrders?.map((_, i) => `${i}:00`) || [],
        datasets: [{
            label: 'Buyurtmalar',
            data: stats?.hourlyOrders || [],
            backgroundColor: 'rgba(255, 107, 107, 0.5)',
            borderColor: 'rgb(255, 107, 107)',
            borderWidth: 2
        }]
    };

    return (
        <div className="min-h-screen bg-base-200">
            <div className="navbar bg-primary text-white">
                <h1 className="flex-1 text-2xl font-bold">👔 Boshliq Dashboard</h1>
                <div className="flex gap-2">
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} className="select select-sm">
                        <option value="daily">Kunlik</option>
                        <option value="weekly">Haftalik</option>
                        <option value="monthly">Oylik</option>
                    </select>
                    <button onClick={logout} className="btn btn-ghost btn-sm">Chiqish</button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Tabs */}
                <div className="tabs tabs-boxed mb-6">
                    <button className={`tab ${activeTab === 'stats' ? 'tab-active' : ''}`} onClick={() => setActiveTab('stats')}>Statistika</button>
                    <button className={`tab ${activeTab === 'menu' ? 'tab-active' : ''}`} onClick={() => setActiveTab('menu')}>Menu</button>
                    <button className={`tab ${activeTab === 'employees' ? 'tab-active' : ''}`} onClick={() => setActiveTab('employees')}>Hodimlar</button>
                    <button className={`tab ${activeTab === 'ingredients' ? 'tab-active' : ''}`} onClick={() => setActiveTab('ingredients')}>Masalliqlar</button>
                    <button className={`tab ${activeTab === 'feedback' ? 'tab-active' : ''}`} onClick={() => setActiveTab('feedback')}>Feedback</button>
                </div>

                {activeTab === 'stats' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="card bg-gradient-to-br from-primary to-secondary text-white shadow-xl">
                                <div className="card-body">
                                    <h3 className="text-lg opacity-80">Jami Buyurtma</h3>
                                    <p className="text-4xl font-bold">{stats?.stats?.totalOrders || 0}</p>
                                </div>
                            </div>
                            <div className="card bg-gradient-to-br from-success to-info text-white shadow-xl">
                                <div className="card-body">
                                    <h3 className="text-lg opacity-80">Jami Pul</h3>
                                    <p className="text-3xl font-bold">{(stats?.stats?.totalRevenue || 0).toLocaleString()} so'm</p>
                                </div>
                            </div>
                            <div className="card bg-gradient-to-br from-warning to-error text-white shadow-xl">
                                <div className="card-body">
                                    <h3 className="text-lg opacity-80">O'rtacha Check</h3>
                                    <p className="text-3xl font-bold">{Math.round(stats?.stats?.averageOrderValue || 0).toLocaleString()} so'm</p>
                                </div>
                            </div>
                            <div className="card bg-gradient-to-br from-accent to-secondary text-white shadow-xl">
                                <div className="card-body">
                                    <h3 className="text-lg opacity-80">O'rtacha Rating</h3>
                                    <p className="text-4xl font-bold">⭐ {stats?.stats?.averageRating || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="card-title">Soatlik Buyurtmalar</h2>
                                    <button onClick={exportToExcel} className="btn btn-success btn-sm">Excel yuklab olish</button>
                                </div>
                                <Bar data={chartData} options={{ responsive: true }} />
                            </div>
                        </div>

                        {/* Popular Items */}
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">Mashhur Mahsulotlar</h2>
                                <div className="overflow-x-auto">
                                    <table className="table table-zebra">
                                        <thead>
                                            <tr><th>Mahsulot</th><th>Sotildi</th></tr>
                                        </thead>
                                        <tbody>
                                            {stats?.popularItems?.map((item, i) => (
                                                <tr key={i}>
                                                    <td>{item.name}</td>
                                                    <td className="font-bold">{item.count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'menu' && (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Menu Boshqaruvi</h2>
                            <p>Menu CRUD - TODO: Implement menu management</p>
                        </div>
                    </div>
                )}

                {activeTab === 'employees' && (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Hodimlar</h2>
                            <p>Employee CRUD - TODO: Implement employee management</p>
                        </div>
                    </div>
                )}

                {activeTab === 'ingredients' && (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Masalliqlar</h2>
                            <p>Ingredients CRUD - TODO: Implement ingredient management</p>
                        </div>
                    </div>
                )}

                {activeTab === 'feedback' && (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Mijoz Feedbacklari</h2>
                            <p>Feedback List - TODO: Implement feedback list</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
