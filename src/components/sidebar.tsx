"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Home, Plug, ChevronLeft, Menu } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/pedidos", label: "Pedidos", icon: Package },
  { href: "/conexoes", label: "Conexões", icon: Plug },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-lg backdrop-blur-md lg:hidden"
      >
        <Menu className="h-5 w-5 text-slate-700" />
      </button>

      {/* Overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/20 bg-white/80 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          collapsed ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-200/60 px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-md">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold tracking-tight text-slate-900">
              Rastreamento
            </h1>
            <p className="truncate text-[11px] text-slate-500">
              Logístico
            </p>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-100 lg:hidden"
          >
            <ChevronLeft className="h-4 w-4 text-slate-500" />
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
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200/60 px-5 py-4">
          <p className="text-[11px] text-slate-400">
            © 2024 Rastreamento
          </p>
        </div>
      </aside>
    </>
  );
}
