import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/Avatar';
import { Dropdown, DropdownItem } from '../components/Dropdown';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  LayoutDashboard, Users, UserCheck, School,
  LogOut, Bell, Menu, X, ChevronLeft, ChevronRight,
  Mail, Trash2
} from 'lucide-react';

export const AdminLayout = () => {
  const { currentUser, logout, mailReceipts, dismissMailReceipt } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Teachers', path: '/admin/teachers', icon: Users },
    { name: 'Parents', path: '/admin/parents', icon: UserCheck },
    { name: 'Classrooms', path: '/admin/classrooms', icon: School },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleLogoutConfirmed = () => { logout(); navigate('/login'); };
  const currentPath = location.pathname;

  const SidebarContent = ({ mobile = false }) => (
    <>
      {/* Brand */}
      <div className={`h-16 border-b border-slate-800/60 flex items-center gap-3 flex-shrink-0 ${isCollapsed && !mobile ? 'px-4 justify-center' : 'px-5'}`}>
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm">
          iC
        </div>
        {(!isCollapsed || mobile) && (
          <div className="overflow-hidden">
            <p className="font-bold text-white text-sm leading-tight tracking-tight">ICode Academy</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Admin Portal</p>
          </div>
        )}
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto p-1.5 rounded-lg text-slate-400 hover:bg-slate-700/50">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav label */}
      {(!isCollapsed || mobile) && (
        <div className="px-5 pt-5 pb-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Navigation</span>
        </div>
      )}

      {/* Nav items */}
      <nav className={`flex-grow px-3 flex flex-col gap-0.5 overflow-y-auto ${isCollapsed && !mobile ? 'pt-4' : 'pt-1'}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => mobile && setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
              }`}
            >
              <Icon size={16} className="flex-shrink-0" />
              {(!isCollapsed || mobile) && <span>{item.name}</span>}
              {isCollapsed && !mobile && (
                <span className="fixed ml-[64px] px-2.5 py-1.5 rounded-lg text-xs bg-slate-900 text-white font-semibold opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl border border-slate-700">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800/60 flex-shrink-0">
        <button
          onClick={() => setConfirmLogout(true)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 transition-all cursor-pointer ${isCollapsed && !mobile ? 'justify-center' : ''}`}
          title="Sign Out"
        >
          <LogOut size={16} className="flex-shrink-0" />
          {(!isCollapsed || mobile) && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen overflow-x-hidden bg-slate-100 flex font-sans text-slate-800">

      {/* Desktop Sidebar — fixed, full height, never scrolls */}
      <aside className={`hidden md:flex flex-col bg-slate-900 fixed top-0 left-0 h-screen z-30 flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-[64px]' : 'w-60'}`}>
        <SidebarContent />
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-[70px] w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 shadow-sm cursor-pointer z-30 transition-all hover:shadow"
        >
          {isCollapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
        </button>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <aside className="w-64 bg-slate-900 h-full flex flex-col relative z-50 shadow-2xl">
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      {/* Main content area — offset by sidebar width, fills remaining height */}
      <div className={`flex flex-col min-w-0 h-screen transition-all duration-300 w-full ${isCollapsed ? 'md:pl-[64px]' : 'md:pl-60'}`}>
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between gap-4 z-20 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 md:hidden cursor-pointer">
              <Menu size={18} />
            </button>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-tight">
                {menuItems.find(m => currentPath === m.path || (m.path !== '/admin' && currentPath.startsWith(m.path)))?.name || 'Dashboard'}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">ICode Academy — Super Admin</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer transition-colors"
            >
              <Bell size={17} />
              {mailReceipts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                  {mailReceipts.length}
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-slate-200" />

            {/* Profile dropdown */}
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                  <Avatar name={currentUser?.name || 'Admin'} size="sm" />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800 leading-tight">{currentUser?.name}</span>
                    <span className="text-[10px] text-slate-400">Super Admin</span>
                  </div>
                </button>
              }
            >
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{currentUser?.email}</p>
              </div>
              <DropdownItem onClick={() => navigate('/admin')}><LayoutDashboard size={14} /> Dashboard</DropdownItem>
              <DropdownItem onClick={() => navigate('/admin/teachers')}><Users size={14} /> Teachers</DropdownItem>
              <DropdownItem onClick={() => navigate('/admin/parents')}><UserCheck size={14} /> Parents</DropdownItem>
              <DropdownItem onClick={() => setConfirmLogout(true)} danger><LogOut size={14} /> Sign Out</DropdownItem>
            </Dropdown>
          </div>
        </header>

        <main className="flex-grow p-6 overflow-y-auto min-h-0">
          <Outlet />
        </main>
      </div>

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div onClick={() => setShowNotifications(false)} className="absolute inset-0 bg-slate-900/20" />
          <aside className="w-80 bg-white border-l border-slate-200 h-full flex flex-col relative z-50 shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50">
                  <Mail size={14} className="text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Email Logs</h3>
                {mailReceipts.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">{mailReceipts.length}</span>
                )}
              </div>
              <button onClick={() => setShowNotifications(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors">
                <X size={15} />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-2">
              {mailReceipts.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center gap-3 h-full text-slate-400">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center ring-1 ring-slate-100">
                    <Mail size={20} className="text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">No emails yet</p>
                    <p className="text-xs text-slate-400 mt-1">Activity logs will appear here.</p>
                  </div>
                </div>
              ) : (
                mailReceipts.map((rcpt) => (
                  <div key={rcpt.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2 group hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md ring-1 ring-emerald-100">Sent</span>
                      <button onClick={() => dismissMailReceipt(rcpt.id)} className="text-slate-300 hover:text-red-400 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 truncate">To: {rcpt.parentName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{rcpt.subject}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{new Date(rcpt.date).toLocaleTimeString()}</p>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}
      <ConfirmDialog
        isOpen={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={handleLogoutConfirmed}
        title="Sign Out"
        message="Are you sure you want to sign out of your session?"
        confirmText="Yes, Sign Out"
        cancelText="Cancel"
      />
    </div>
  );
};
