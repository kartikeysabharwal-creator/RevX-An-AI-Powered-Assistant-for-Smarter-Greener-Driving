'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Car,
  BarChart3,
  PiggyBank,
  Trophy,
  Heart,
  Play,
  Gauge,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/trips', label: 'Trips', icon: Car },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/savings', label: 'Savings', icon: PiggyBank },
  { href: '/dashboard/achievements', label: 'Achievements', icon: Trophy },
  { href: '/dashboard/health', label: 'Vehicle Health', icon: Heart },
  { href: '/dashboard/simulator', label: 'Simulator', icon: Play },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(item: typeof navItems[0]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  const Sidebar = ({ mobile = false }) => (
    <nav
      className={
        mobile
          ? 'flex flex-col gap-1 p-4'
          : 'h-full flex flex-col'
      }
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-revx-border mb-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
          <Gauge className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-black tracking-widest uppercase text-revx-platinum">RevX</div>
          <div className="text-[10px] text-revx-titanium tracking-wide">Smart Driving</div>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={[
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                  : 'text-revx-titanium hover:text-revx-platinum hover:bg-revx-card border border-transparent',
              ].join(' ')}
            >
              <item.icon className={['w-4 h-4 flex-shrink-0', active ? 'text-emerald-400' : 'text-revx-titanium group-hover:text-revx-platinum'].join(' ')} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 text-emerald-400" />}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-revx-border mt-auto">
        <Link href="/" className="flex items-center gap-2 text-xs text-revx-titanium hover:text-revx-platinum transition-colors">
          <span>← Back to website</span>
        </Link>
        <div className="text-[10px] text-revx-titanium/50 mt-1">RevX v1.4.0 · Green Computing</div>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen bg-revx-dark text-revx-platinum overflow-hidden">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex w-56 flex-col bg-revx-surface border-r border-revx-border flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 w-64 bg-revx-surface border-r border-revx-border">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 text-revx-titanium hover:text-revx-platinum"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar mobile />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-4 px-4 py-3 border-b border-revx-border bg-revx-surface">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg hover:bg-revx-card">
            <Menu className="w-5 h-5 text-revx-titanium" />
          </button>
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold tracking-widest uppercase">RevX</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
