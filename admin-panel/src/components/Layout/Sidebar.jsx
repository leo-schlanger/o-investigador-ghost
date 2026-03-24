import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Image,
  Users,
  Settings,
  Megaphone,
  User,
  File,
  Tag,
  LogOut,
  BarChart2,
  Mail
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Default to 'author' if for some reason user is not loaded yet
  const currentRole = user?.role || 'author';

  const navItems = [
    { icon: LayoutDashboard, label: 'Painel', path: '/', roles: ['admin', 'editor', 'author'] },
    { icon: User, label: 'Meu Perfil', path: '/profile', roles: ['admin', 'editor', 'author'] },
    { icon: FileText, label: 'Artigos', path: '/articles', roles: ['admin', 'editor', 'author'] },
    { icon: File, label: 'Paginas', path: '/pages', roles: ['admin', 'editor'] },
    { icon: Tag, label: 'Tags', path: '/tags', roles: ['admin', 'editor'] },
    { icon: Image, label: 'Midia', path: '/media', roles: ['admin', 'editor', 'author'] },
    { icon: Users, label: 'Usuarios', path: '/users', roles: ['admin'] },
    { icon: Megaphone, label: 'Anuncios', path: '/advertisements', roles: ['admin', 'editor'] },
    { icon: Mail, label: 'Newsletter', path: '/newsletter', roles: ['admin', 'editor'] },
    { icon: BarChart2, label: 'Relatorios', path: '/reports', roles: ['admin', 'editor'] },
    { icon: Settings, label: 'Configuracoes', path: '/settings', roles: ['admin'] }
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(currentRole));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <aside className="w-full h-full bg-brand-dark text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-white/10 shrink-0">
        <div className="flex flex-col leading-none">
          <span
            className="font-extrabold text-white text-xl tracking-tight"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            investigador
          </span>
          <span
            className="text-[9px] text-primary-300 font-normal tracking-[0.25em] self-end -mt-0.5"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            jornal online
          </span>
        </div>
        <span className="text-[10px] text-primary-400 mt-2 block">Painel Administrativo</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto scrollbar-hide">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleNavClick}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base',
                isActive
                  ? 'bg-brand text-white'
                  : 'text-primary-300 hover:bg-primary-900 hover:text-white'
              )
            }
          >
            <item.icon size={20} className="shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-3 sm:p-4 border-t border-primary-900 shrink-0 space-y-2">
        <div className="flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full object-cover border-2 border-primary-700"
            />
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-primary-700 flex items-center justify-center rounded-full text-brand font-bold text-base sm:text-lg">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{user?.name || 'Usuario'}</p>
            <p className="text-xs text-primary-400 capitalize">{user?.role || 'Autor'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 text-primary-300 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors text-sm"
        >
          <LogOut size={18} className="shrink-0" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
