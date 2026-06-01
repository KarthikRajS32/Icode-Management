import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/Avatar';
import { Dropdown, DropdownItem } from '../components/Dropdown';
import {
  LayoutDashboard, School, ClipboardList,
  LogOut, Bell, Menu, X, ChevronLeft, ChevronRight,
  Mail, Trash2
} from 'lucide-react';

export const TeacherLayout = () => {
  const { currentUser, logout, mailReceipts, dismissMailReceipt, teachers } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const teacherDetails = teachers.find(t => t.id === currentUser?.associatedId);

  const menuItems = [
    { name: 'Dashboard', path: '/teacher', icon: LayoutDashboard },
    { name: 'My Classrooms', path: '/teacher/classrooms', icon: School },
    { name: 'Student Activities', path: '/teacher/activities', icon: ClipboardList },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };
  const currentPath = location.pathname;

  const SidebarContent = ({ mobile = false }) => (
    <>
      <div className="h-16 px-5 border-b border-gray-100 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
            iC
          </div>
          {(!isCollapsed || mobile) && (
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">ICode Teacher</p>
              <p className="text-[10px] text-gray-400 font-medium">Faculty Portal</p>
            </div>
          )}
        </div>
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-grow p-3 flex flex-col gap-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path !== '/teacher' && currentPath.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => mobile && setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {(!isCollapsed || mobile) && <span>{item.name}</span>}
              {isCollapsed && !mobile && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs bg-gray-900 text-white font-medium opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-lg">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-150 cursor-pointer"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {(!isCollapsed || mobile) && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-gray-100 transition-all duration-300 relative z-30 flex-shrink-0 ${isCollapsed ? 'w-[68px]' : 'w-60'}`}>
        <SidebarContent />
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-[72px] w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm cursor-pointer z-30 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
          <aside className="w-60 bg-white h-full flex flex-col relative z-50 shadow-xl">
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between gap-4 z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 md:hidden cursor-pointer">
              <Menu size={20} />
            </button>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {menuItems.find(m => currentPath === m.path || (m.path !== '/teacher' && currentPath.startsWith(m.path)))?.name || 'Dashboard'}
              </p>
              <p className="text-xs text-gray-400">{teacherDetails?.subject || 'Teacher Portal'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer transition-colors"
            >
              <Bell size={18} />
              {mailReceipts.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {mailReceipts.length}
                </span>
              )}
            </button>

            <Dropdown
              trigger={
                <button className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                  <Avatar name={currentUser?.name || 'Teacher'} size="sm" />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold text-gray-800 leading-tight">{currentUser?.name}</span>
                    <span className="text-[10px] text-gray-400">{teacherDetails?.subject || 'Teacher'}</span>
                  </div>
                </button>
              }
            >
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-800">{currentUser?.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{teacherDetails?.subject}</p>
              </div>
              <DropdownItem onClick={() => navigate('/teacher')}><LayoutDashboard size={14} /> Dashboard</DropdownItem>
              <DropdownItem onClick={() => navigate('/teacher/classrooms')}><School size={14} /> My Classrooms</DropdownItem>
              <DropdownItem onClick={() => navigate('/teacher/activities')}><ClipboardList size={14} /> Activities</DropdownItem>
              <DropdownItem onClick={handleLogout} danger><LogOut size={14} /> Sign Out</DropdownItem>
            </Dropdown>
          </div>
        </header>

        <main className="flex-grow p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div onClick={() => setShowNotifications(false)} className="absolute inset-0 bg-black/10" />
          <aside className="w-80 bg-white border-l border-gray-100 h-full flex flex-col relative z-50 shadow-xl">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-blue-500" />
                <h3 className="font-semibold text-gray-800 text-sm">Activity Email Logs</h3>
                {mailReceipts.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">{mailReceipts.length}</span>
                )}
              </div>
              <button onClick={() => setShowNotifications(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3">
              {mailReceipts.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center gap-3 h-full text-gray-400">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Mail size={20} className="text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">No emails yet</p>
                    <p className="text-xs text-gray-400 mt-1">Logs appear after submitting activities.</p>
                  </div>
                </div>
              ) : (
                mailReceipts.map((rcpt) => (
                  <div key={rcpt.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-2 group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Sent</span>
                      <button onClick={() => dismissMailReceipt(rcpt.id)} className="text-gray-300 hover:text-red-400 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 truncate">To: {rcpt.parentName}</p>
                    <p className="text-[11px] text-gray-500 truncate">{rcpt.subject}</p>
                    <p className="text-[10px] text-gray-400">{new Date(rcpt.date).toLocaleTimeString()}</p>
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
