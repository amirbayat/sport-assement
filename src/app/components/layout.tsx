import { useState } from 'react';
import {
  LayoutDashboard, Users, BookOpen, LogOut, Menu, X, ChevronLeft,
  Activity,
} from 'lucide-react';
import { View } from '../types';

interface NavItem {
  id: View;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'داشبورد', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'athletes', label: 'ورزشکاران', icon: <Users className="w-5 h-5" /> },
  { id: 'standards', label: 'استانداردها', icon: <BookOpen className="w-5 h-5" /> },
];

interface Props {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  pageTitle: string;
  children: React.ReactNode;
}

export function Layout({ currentView, onNavigate, onLogout, pageTitle, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeView = NAV_ITEMS.some(n => n.id === currentView)
    ? currentView
    : NAV_ITEMS[0].id;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)', direction: 'rtl' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-60 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
        style={{
          background: 'var(--sidebar)',
          borderLeft: '1px solid var(--sidebar-border)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--sidebar-primary)' }}
          >
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: 'var(--sidebar-foreground)', fontFamily: 'Vazirmatn, sans-serif' }}>
              مرکز سنجش
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Vazirmatn, sans-serif' }}>
              آمادگی جسمانی
            </p>
          </div>
          <button
            className="mr-auto lg:hidden"
            style={{ color: 'rgba(255,255,255,0.7)' }}
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={{
                  background: isActive ? 'var(--sidebar-accent)' : 'transparent',
                  color: isActive ? 'var(--sidebar-foreground)' : 'rgba(255,255,255,0.65)',
                  fontFamily: 'Vazirmatn, sans-serif',
                  borderRight: isActive ? '3px solid var(--sidebar-primary)' : '3px solid transparent',
                }}
                onMouseEnter={e => !isActive && ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)')}
                onMouseLeave={e => !isActive && ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronLeft className="w-4 h-4 mr-auto opacity-70" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
            style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Vazirmatn, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">خروج از سیستم</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header
          className="flex items-center gap-4 px-4 py-4 border-b flex-shrink-0"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg"
            style={{ color: 'var(--muted-foreground)', background: 'var(--muted)' }}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1
            className="text-base font-semibold"
            style={{ color: 'var(--foreground)', fontFamily: 'Vazirmatn, sans-serif' }}
          >
            {pageTitle}
          </h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 inset-x-0 z-30 flex lg:hidden border-t"
        style={{ background: 'var(--sidebar)', borderColor: 'var(--sidebar-border)' }}
      >
        {NAV_ITEMS.map(item => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors"
              style={{
                color: isActive ? 'var(--sidebar-primary)' : 'rgba(255,255,255,0.55)',
                fontFamily: 'Vazirmatn, sans-serif',
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
