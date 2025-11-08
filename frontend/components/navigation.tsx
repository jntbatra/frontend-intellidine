"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  ChefHat,
  ShoppingCart,
  History,
  Menu as MenuIcon,
  Home,
  LogOut,
} from "lucide-react";

interface NavigationProps {
  cartItemCount?: number;
}

export function Navigation({ cartItemCount = 0 }: NavigationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tableId = searchParams.get("table_id");
  const tenantId = searchParams.get("tenant_id");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tenantName, setTenantName] = useState("Restaurant");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch tenant information
  useEffect(() => {
    const fetchTenantInfo = async () => {
      if (!tenantId) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tenants/${tenantId}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(localStorage.getItem("auth_token") && {
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
              }),
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setTenantName(data.data?.name || data.name || "Restaurant");
        }
      } catch (error) {
        console.error("Failed to fetch tenant info:", error);
        // Keep default name if fetch fails
      }
    };

    fetchTenantInfo();
  }, [tenantId]);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("staff_role");
    setIsAuthenticated(!!token && role !== "kitchen"); // Kitchen staff have different access
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("staff_role");
    localStorage.removeItem("current_tenant_id");
    localStorage.removeItem("customer_id");
    setIsAuthenticated(false);
    // Redirect to home page
    window.location.href = "/";
  };

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/",
      requiresParams: false,
    },
    {
      href:
        tableId && tenantId
          ? `/menu?table_id=${tableId}&tenant_id=${tenantId}`
          : "/menu",
      label: "Menu",
      icon: MenuIcon,
      active: pathname?.startsWith("/menu"),
      requiresParams: true,
    },
    {
      href:
        tableId && tenantId
          ? `/cart?table_id=${tableId}&tenant_id=${tenantId}`
          : "/cart",
      label: "Cart",
      icon: ShoppingCart,
      active: pathname?.startsWith("/cart"),
      badge: cartItemCount > 0 ? cartItemCount : undefined,
      requiresParams: true,
    },
    {
      href:
        tableId && tenantId
          ? `/orders?table_id=${tableId}&tenant_id=${tenantId}`
          : "/orders",
      label: "Orders",
      icon: History,
      active: pathname?.startsWith("/orders"),
      requiresParams: true,
    },
  ];

  const NavLink = ({
    item,
    mobile = false,
  }: {
    item: (typeof navItems)[0];
    mobile?: boolean;
  }) => {
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        onClick={() => mobile && setIsMobileMenuOpen(false)}
        className={`w-full ${mobile ? "block" : ""}`}
      >
        <Button
          variant={item.active ? "default" : "ghost"}
          className={`w-full justify-start px-4 py-3 text-base font-medium transition-all duration-200 min-h-12 ${
            item.active
              ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md"
              : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
          } ${mobile ? "rounded-lg mb-2" : ""}`}
        >
          <Icon className="h-5 w-5 mr-3" />
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge && (
            <Badge className="ml-2 bg-red-500 text-white text-xs px-2 py-0 min-w-6 h-6 flex items-center justify-center">
              {item.badge}
            </Badge>
          )}
        </Button>
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-lg border-b-2 border-orange-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              {tenantName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
            {isAuthenticated && (
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="flex items-center space-x-2 px-4 py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-linear-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                        <ChefHat className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {tenantName}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {navItems.map((item) => (
                    <NavLink key={item.href} item={item} mobile />
                  ))}
                  {isAuthenticated && (
                    <Button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      variant="ghost"
                      className="w-full justify-start px-4 py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg mb-2"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      <span>Logout</span>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
