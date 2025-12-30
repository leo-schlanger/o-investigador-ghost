import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Image, Users, Settings } from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: FileText, label: 'Articles', path: '/articles' },
        { icon: Image, label: 'Media', path: '/media' },
        { icon: Users, label: 'Authors', path: '/authors' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
            <div className="p-6 border-b border-gray-800 flex items-center gap-2">
                <img src="/logo.jpg" alt="Logo" className="h-8 w-8 rounded-full object-cover" />
                <div>
                    <h1 className="text-xl font-bold">O Investigador</h1>
                    <span className="text-xs text-gray-500">Admin Panel</span>
                </div>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            )
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                    <div>
                        <p className="text-sm font-medium">Admin User</p>
                        <p className="text-xs text-gray-500">Editor</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
