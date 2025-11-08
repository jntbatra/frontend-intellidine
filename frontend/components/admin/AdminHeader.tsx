"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminHeader() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("staff_role");
    localStorage.removeItem("current_tenant_id");
    router.push("/staff/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      {/* Left side - Title */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Admin Panel</h2>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-orange-600" />
              </div>
              <span className="text-sm font-medium text-slate-900">Manager</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <User size={16} className="mr-2" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
