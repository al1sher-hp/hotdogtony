import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiX } from 'react-icons/fi';

let addToast;

const Toast = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        addToast = (message, type = 'info') => {
            const id = Date.now();
            setToasts(prev => [...prev, { id, message, type }]);

            setTimeout(() => {
                setToasts(prev => prev.filter(toast => toast.id !== id));
            }, 5000);
        };
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <FiCheckCircle className="w-6 h-6" />;
            case 'error':
                return <FiXCircle className="w-6 h-6" />;
            default:
                return <FiAlertCircle className="w-6 h-6" />;
        }
    };

    const getColorClasses = (type) => {
        switch (type) {
            case 'success':
                return 'alert-success';
            case 'error':
                return 'alert-error';
            default:
                return 'alert-info';
        }
    };

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`alert ${getColorClasses(toast.type)} shadow-lg animate-slide-in`}>
                    <div className="flex items-center gap-3">
                        {getIcon(toast.type)}
                        <span>{toast.message}</span>
                    </div>
                    <button onClick={() => removeToast(toast.id)} className="btn btn-ghost btn-sm btn-circle">
                        <FiX />
                    </button>
                </div>
            ))}
        </div>
    );
};

export const showToast = (message, type = 'info') => {
    if (addToast) {
        addToast(message, type);
    }
};

export default Toast;
