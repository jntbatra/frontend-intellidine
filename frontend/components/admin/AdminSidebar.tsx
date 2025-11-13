"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  UtensilsCrossed,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/staff", icon: Users, label: "Staff", exact: false },
  { href: "/admin/menu", icon: UtensilsCrossed, label: "Menu", exact: false },
  { href: "/admin/orders", icon: ClipboardList, label: "Orders", exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen overflow-hidden">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200 shrink-0">
        <h1 className="text-xl font-bold text-slate-900">🍽️ IntelliDine</h1>
        <p className="text-xs text-slate-500">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-orange-100 text-orange-900"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 text-xs text-slate-500 shrink-0">
        <p>🔐 Logged in as Manager</p>
      </div>
    </aside>
  );
}
