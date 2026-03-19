import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, []);

    // Close sidebar when clicking escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setSidebarOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [sidebarOpen]);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-brand-dark text-white h-14 flex items-center px-4 shadow-lg">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Abrir menu"
                >
                    <Menu size={24} />
                </button>
                <div className="ml-3 flex flex-col leading-none">
                    <span className="font-extrabold text-white text-lg tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        investigador
                    </span>
                    <span className="text-[8px] text-primary-300 font-normal tracking-[0.2em]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        painel admin
                    </span>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Desktop Sidebar - Fixed */}
            <aside
                className={`
                    fixed top-0 left-0 z-50 h-screen w-72 max-w-[85vw]
                    transform transition-transform duration-300 ease-in-out
                    lg:translate-x-0 lg:w-64 lg:z-30
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Mobile Close Button */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 z-10"
                    aria-label="Fechar menu"
                >
                    <X size={20} />
                </button>
                <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </aside>

            {/* Main Content */}
            <main className="min-h-screen lg:ml-64">
                {/* Spacer for mobile header */}
                <div className="h-14 lg:hidden" />

                <div className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
