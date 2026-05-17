import React from 'react';
import { LayoutDashboard, Map as MapIcon, History, Settings, LogOut, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ user, setUser, isOpen, onClose }) => {
  const menu = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <MapIcon size={18} />, label: 'Active Ride', path: '/dashboard/active' },
    { icon: <History size={18} />, label: 'History', path: '/dashboard/history' },
    { icon: <Settings size={18} />, label: 'Settings', path: '/dashboard/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('rydo_user');
    setUser(null);
  };

  const renderContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-10">
        <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-surface-base font-black text-base leading-none">R</span>
        </div>
        <span className="text-white font-black text-xl tracking-[-0.05em]">RYDO</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        <p className="text-[10px] font-bold text-surface-muted uppercase tracking-widest px-3 mb-3">Navigation</p>
        {menu.map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <NavLink
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                    : 'text-surface-muted hover:text-white hover:bg-surface-base'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-surface-border pt-5 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-amber-400/15 border border-amber-400/25 flex items-center justify-center shrink-0">
            <User size={15} className="text-amber-400" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate leading-tight">{user?.username || 'Operator'}</p>
            <p className="text-[10px] text-surface-muted capitalize">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-surface-muted hover:text-red-400 hover:bg-red-400/8 transition-all"
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Drawer (Mobile) */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full z-50 w-64 border-r border-surface-border bg-surface-card flex flex-col py-6 px-4 md:hidden"
          >
            {renderContent()}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Static Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 border-r border-surface-border bg-surface-card flex-col py-6 px-4 shrink-0">
        {renderContent()}
      </aside>
    </>
  );
};

export default Sidebar;