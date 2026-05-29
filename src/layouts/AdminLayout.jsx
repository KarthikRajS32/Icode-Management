import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Dropdown, DropdownItem } from '../components/Dropdown';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  School,
  LogOut,
  Bell,
  Menu,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Trash2
} from 'lucide-react';

/**
 * Premium Admin Portal Layout Wrapper
 */
export const AdminLayout = () => {
  const { currentUser, logout, mailReceipts, dismissMailReceipt } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Sidebar Collapse states
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Notifications outbox drawer state
  const [showNotifications, setShowNotifications] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Teachers', path: '/admin/teachers', icon: Users },
    { name: 'Parents', path: '/admin/parents', icon: UserCheck },
    { name: 'Classrooms', path: '/admin/classrooms', icon: School },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR PANEL */}
      {/* ========================================================================= */}
      <aside
        className={`hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-300 relative z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header Block */}
        <div className="h-20 px-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0">
              iC
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm tracking-tight">ICode Admin</span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Portal</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-grow p-4 flex flex-col gap-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group relative ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-100'
                }`}
              >
                <Icon size={20} className={`flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span>{item.name}</span>}
                
                {/* Tooltip trigger on collapsed state */}
                {isCollapsed && (
                  <span className="absolute left-full ml-4 px-2.5 py-1.5 rounded-lg text-xs bg-slate-900 text-white font-semibold opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Block */}
        <div className="p-4 border-t border-slate-50 dark:border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-300 cursor-pointer`}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Toggle Collapse Trigger */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shadow-md cursor-pointer hover:scale-105 z-30 transition-transform duration-200"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER DRAWER PANEL */}
      {/* ========================================================================= */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Overlay mask */}
          <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs" />
          
          <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 h-full flex flex-col relative z-50 animate-in slide-in-from-left duration-250">
            <div className="h-20 px-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg">
                  iC
                </div>
                <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm tracking-tight">ICode Admin</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-grow p-4 flex flex-col gap-1.5 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-100'
                    }`}
                  >
                    <Icon size={20} className="text-slate-400" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-4 border-t border-slate-50 dark:border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT BODY */}
      {/* ========================================================================= */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header Navigation Bar */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 px-6 flex items-center justify-between gap-4 z-20 shadow-xs relative">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-1 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 md:hidden cursor-pointer"
            >
              <Menu size={20} />
            </button>
            
            {/* Topbar Search input mockup */}
            <div className="relative hidden sm:flex items-center">
              <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Global search portal..."
                className="w-64 pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-100 transition-all duration-300"
              />
            </div>
          </div>

          {/* Topbar controls */}
          <div className="flex items-center gap-4">
            
            {/* Notification outbox log center */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors duration-200 relative ${
                  mailReceipts.length > 0 ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                }`}
              >
                <Bell size={20} />
                {mailReceipts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center border border-white dark:border-slate-900 animate-bounce">
                    {mailReceipts.length}
                  </span>
                )}
              </button>
            </div>

            {/* Profile trigger */}
            <Dropdown
              trigger={
                <button className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                  <Avatar name={currentUser?.name || 'Admin'} size="sm" showStatus status="online" />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold leading-tight">{currentUser?.name || 'Administrator'}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{currentUser?.email}</span>
                  </div>
                </button>
              }
            >
              <div className="px-4 py-2 text-xs border-b border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-700 dark:text-slate-300">{currentUser?.name}</p>
                <p className="text-slate-400 mt-0.5">{currentUser?.email}</p>
              </div>
              <DropdownItem onClick={() => navigate('/admin')}>
                <LayoutDashboard size={14} /> My Dashboard
              </DropdownItem>
              <DropdownItem onClick={() => navigate('/admin/teachers')}>
                <Users size={14} /> Manage Teachers
              </DropdownItem>
              <DropdownItem onClick={() => navigate('/admin/parents')}>
                <UserCheck size={14} /> Manage Parents
              </DropdownItem>
              <DropdownItem onClick={handleLogout} danger>
                <LogOut size={14} /> Sign Out
              </DropdownItem>
            </Dropdown>
          </div>
        </header>

        {/* Viewport content area */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto relative">
          <Outlet />
        </main>
      </div>

      {/* ========================================================================= */}
      {/* Dynamic Mock Outbox Notifications panel */}
      {/* ========================================================================= */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay mask */}
          <div onClick={() => setShowNotifications(false)} className="absolute inset-0 bg-slate-950/20 backdrop-blur-xs" />
          
          <aside className="w-96 max-w-full bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 h-full flex flex-col relative z-50 shadow-2xl animate-in slide-in-from-right duration-250">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-indigo-500" />
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">Outgoing Mock Email logs</h3>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Outbox Timeline List */}
            <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-4">
              {mailReceipts.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center gap-2 h-full text-slate-400">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-xs">No emails dispatched yet</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                      When a teacher logs student activity, outgoing email logs will populate here.
                    </p>
                  </div>
                </div>
              ) : (
                mailReceipts.map((rcpt) => (
                  <div
                    key={rcpt.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col gap-2 shadow-xs group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="indigo" className="text-[8px] px-1.5 py-0.5">
                        {rcpt.status}
                      </Badge>
                      <button
                        onClick={() => dismissMailReceipt(rcpt.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        To: {rcpt.parentName} ({rcpt.to})
                      </p>
                      <p className="text-xs font-extrabold text-indigo-600 mt-1 leading-tight">
                        {rcpt.subject}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Activity: "{rcpt.activityTitle}"
                      </p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-semibold">
                        Logged: {new Date(rcpt.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
