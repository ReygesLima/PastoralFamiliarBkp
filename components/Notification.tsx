import React, { useState, useEffect } from 'react';
import { SuccessIcon, ErrorIcon, NotificationCloseIcon } from './icons';

interface NotificationProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            handleClose();
        }, 5000); 

        return () => clearTimeout(timer);
    }, []);
    
    const handleClose = () => {
        setIsVisible(false);
        // Delay closing to allow for fade-out animation
        setTimeout(onClose, 300); 
    };

    const baseClasses = "flex items-center w-full max-w-xs p-4 text-gray-500 bg-white dark:bg-slate-800 rounded-lg shadow-lg";
    const typeClasses = {
        success: "text-green-800 dark:text-green-300",
        error: "text-red-800 dark:text-red-300",
    };
    const iconClasses = "inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg";
    const iconTypeClasses = {
        success: "bg-green-100 dark:bg-green-800 text-green-500 dark:text-green-200",
        error: "bg-red-100 dark:bg-red-800 text-red-500 dark:text-red-200",
    };

    return (
        <div
            className={`${baseClasses} ${typeClasses[type]} transition-all duration-300 ease-in-out transform ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
            role="alert"
        >
            <div className={`${iconClasses} ${iconTypeClasses[type]}`}>
                {type === 'success' ? <SuccessIcon className="w-5 h-5" /> : <ErrorIcon className="w-5 h-5" />}
            </div>
            <div className="ml-3 text-sm font-normal flex-1 text-slate-700 dark:text-slate-200">{message}</div>
            <button
                type="button"
                className="ml-auto -mx-1.5 -my-1.5 bg-white dark:bg-slate-800 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-600 p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 inline-flex items-center justify-center h-8 w-8"
                onClick={handleClose}
                aria-label="Close"
            >
                <span className="sr-only">Close</span>
                <NotificationCloseIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Notification;
