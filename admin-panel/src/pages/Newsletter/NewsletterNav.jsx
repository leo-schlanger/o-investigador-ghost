import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Mail, Settings } from 'lucide-react';

const NewsletterNav = () => {
    const navItems = [
        { to: '/newsletter', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/newsletter/subscribers', label: 'Subscritores', icon: Users },
        { to: '/newsletter/campaigns', label: 'Campanhas', icon: Mail },
        { to: '/newsletter/settings', label: 'Configuracoes', icon: Settings },
    ];

    return (
        <div className="bg-white rounded-lg shadow mb-6">
            <nav className="flex overflow-x-auto">
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                                isActive
                                    ? 'border-brand text-brand'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                        }
                    >
                        <item.icon size={18} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default NewsletterNav;
