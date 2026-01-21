import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';


export default function SuperAdminDashboard() {
    const [activeTab, setActiveTab] = useState('users');
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-base-200">
            <div className="navbar bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
                <h1 className="flex-1 text-2xl font-bold">🔐 Super Admin Dashboard</h1>
                <button onClick={logout} className="btn btn-ghost btn-sm">Chiqish</button>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="tabs tabs-boxed mb-6">
                    <button className={`tab ${activeTab === 'users' ? 'tab-active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
                    <button className={`tab ${activeTab === 'orders' ? 'tab-active' : ''}`} onClick={() => setActiveTab('orders')}>Orders</button>
                    <button className={`tab ${activeTab === 'menu' ? 'tab-active' : ''}`} onClick={() => setActiveTab('menu')}>Menu</button>
                    <button className={`tab ${activeTab === 'ingredients' ? 'tab-active' : ''}`} onClick={() => setActiveTab('ingredients')}>Ingredients</button>
                    <button className={`tab ${activeTab === 'feedback' ? 'tab-active' : ''}`} onClick={() => setActiveTab('feedback')}>Feedback</button>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Super Admin Panel</h2>
                        <p className="text-gray-600">
                            Full CRUD access to all data tables.
                            <br />
                            TODO: Implement data tables with edit/delete functionality for:
                        </p>
                        <ul className="list-disc list-inside mt-4 space-y-2">
                            <li>Users (all roles)</li>
                            <li>Orders (all status)</li>
                            <li>Menu Items</li>
                            <li>Ingredients</li>
                            <li>Feedback</li>
                        </ul>
                        <div className="alert alert-info mt-6">
                            <span>
                                Super Admin has full access to view, edit, and delete all data in the system.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
