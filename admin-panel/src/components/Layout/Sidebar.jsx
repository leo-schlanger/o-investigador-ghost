import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Image, Users, Settings, Megaphone, User } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();

    // Default to 'author' if for some reason user is not loaded yet
    const currentRole = user?.role || 'author';

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['admin', 'editor', 'author'] },
        { icon: User, label: 'Meu Perfil', path: '/profile', roles: ['admin', 'editor', 'author'] },
        { icon: FileText, label: 'Articles', path: '/articles', roles: ['admin', 'editor', 'author'] },
        { icon: Image, label: 'Media', path: '/media', roles: ['admin', 'editor', 'author'] },
        { icon: Users, label: 'Usuários', path: '/users', roles: ['admin'] },
        { icon: Megaphone, label: 'Anúncios', path: '/advertisements', roles: ['admin', 'editor'] },
        { icon: Settings, label: 'Settings', path: '/settings', roles: ['admin'] },
    ];

    const filteredNavItems = navItems.filter(item => item.roles.includes(currentRole));

    return (
        <aside className="w-64 bg-brand-dark text-white min-h-screen flex flex-col">
            <div className="p-6 border-b border-white/10">
                <div className="flex flex-col leading-none">
                    <span className="font-extrabold text-white text-xl tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        investigador
                    </span>
                    <span className="text-[9px] text-primary-300 font-normal tracking-[0.25em] self-end -mt-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        jornal online
                    </span>
                </div>
                <span className="text-[10px] text-primary-400 mt-2 block">Admin Panel</span>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {filteredNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                isActive ? 'bg-brand text-white' : 'text-primary-300 hover:bg-primary-900 hover:text-white'
                            )
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-primary-900">
                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-10 h-10 bg-primary-700 flex items-center justify-center rounded-full text-brand font-bold text-lg">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <p className="text-sm font-medium">{user?.name || 'User'}</p>
                        <p className="text-xs text-primary-400 capitalize">{user?.role || 'Author'}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
