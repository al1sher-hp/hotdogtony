import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import socket from './utils/socket';

// Pages (these will be created)
import CustomerLanding from './pages/CustomerLanding';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import OrderConfirmation from './pages/OrderConfirmation';
import CustomerProfile from './pages/CustomerProfile';
import VerifyMagicLink from './pages/VerifyMagicLink';

import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeDashboard from './pages/EmployeeDashboard';

import DisplayScreen from './pages/DisplayScreen';

import BossLogin from './pages/BossLogin';
import BossDashboard from './pages/BossDashboard';

import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

// Components
import LoadingSpinner from './components/shared/LoadingSpinner';
import Toast from './components/shared/Toast';

function AppContent() {
    const { user, loading } = useAuth();

    useEffect(() => {
        // Connect socket
        socket.connect();

        return () => {
            socket.disconnect();
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <Router>
            <Toast />
            <Routes>
                {/* Public Customer Routes */}
                <Route path="/" element={<CustomerLanding />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                <Route path="/verify-magic-link" element={<VerifyMagicLink />} />

                {/* Customer Protected Routes */}
                <Route
                    path="/profile"
                    element={user?.role === 'customer' ? <CustomerProfile /> : <Navigate to="/" />}
                />

                {/* Employee Routes */}
                <Route path="/employee/login" element={<EmployeeLogin />} />
                <Route
                    path="/employee/dashboard"
                    element={
                        user?.role === 'employee' || user?.role === 'boss' || user?.role === 'super-admin'
                            ? <EmployeeDashboard />
                            : <Navigate to="/employee/login" />
                    }
                />

                {/* Display Screen (Public) */}
                <Route path="/display" element={<DisplayScreen />} />

                {/* Boss Routes */}
                <Route path="/boss/login" element={<BossLogin />} />
                <Route
                    path="/boss/dashboard"
                    element={
                        user?.role === 'boss' || user?.role === 'super-admin'
                            ? <BossDashboard />
                            : <Navigate to="/boss/login" />
                    }
                />

                {/* Super Admin Routes */}
                <Route path="/super-admin/login" element={<SuperAdminLogin />} />
                <Route
                    path="/super-admin/dashboard"
                    element={
                        user?.role === 'super-admin'
                            ? <SuperAdminDashboard />
                            : <Navigate to="/super-admin/login" />
                    }
                />

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
