import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="sticky top-0 h-screen shrink-0">
                <Sidebar />
            </div>
            <main className="flex-1 overflow-auto min-h-screen scrollbar-thin">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
