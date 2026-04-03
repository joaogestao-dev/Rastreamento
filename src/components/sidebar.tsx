"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Plug, ChevronLeft, Menu } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pedidos", label: "Pedidos", icon: Package },
  { href: "/conexoes", label: "Conexões", icon: Plug },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-xl glass-elevated lg:hidden"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col transition-transform duration-300 lg:translate-x-0 ${
          collapsed ? "-translate-x-full" : "translate-x-0"
        }`}
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: "4px 0 32px 0 rgba(31, 38, 135, 0.15)",
        }}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold tracking-tight text-foreground">
              TrackFlow
            </h1>
            <p className="truncate text-[11px] text-muted-foreground">
              Rastreamento Logístico
            </p>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors lg:hidden"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setCollapsed(true)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white/10 text-foreground shadow-[0_2px_12px_0_rgba(120,80,255,0.15)] border border-white/[0.08]"
                    : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground border border-transparent"
                }`}
              >
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary/20 shadow-sm shadow-primary/20"
                    : "bg-transparent group-hover:bg-white/[0.04]"
                }`}>
                  <Icon
                    className={`h-[16px] w-[16px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                </div>
                {item.label}
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-sm shadow-primary/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Version */}
        <div className="border-t border-white/[0.06] px-5 py-3">
          <p className="text-[10px] font-mono text-muted-foreground/40">v1.0.0</p>
        </div>
      </aside>
    </>
  );
}
