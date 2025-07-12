"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Home, Calendar, AreaChartIcon as ChartArea } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
import { cn } from "@/lib/utils";
import Link from "next/link";

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: Calendar,
  },
  {
    href: "/statistics",
    label: "Statistics",
    icon: ChartArea,
  },
];

export function Header() {
  const pathname = usePathname();
  //   const [activeTab, setActiveTab] = useState("/");

  // Sync activeTab with pathname
  //   useEffect(() => {
  //     setActiveTab(pathname);
  //   }, [pathname]);

  return (
    <>
      {/* Desktop Navigation - Top */}
      <nav className="hidden md:flex items-center justify-between max-w-6xl mx-auto px-6 py-3 bg-background">
        {/* Logo */}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-primary-foreground"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L10.5 10.84L6.5 8.84L2 13.34L3.5 14.84L6.5 11.84L10.5 13.84L17.83 6.5L20.5 9.17L22 7.67L21 9Z" />
            </svg>
          </div>
        </div>
        {/* Navigation Items */}
        <div className="flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-foreground bg-muted font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
        {/* Theme Toggle */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </nav>
      {/* Mobile Top Bar - Logo and Theme Toggle */}
      <nav className="md:hidden flex items-center justify-between px-6 py-3 border-b bg-background">
        {/* Logo */}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-primary-foreground"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L10.5 10.84L6.5 8.84L2 13.34L3.5 14.84L6.5 11.84L10.5 13.84L17.83 6.5L20.5 9.17L22 7.67L21 9Z" />
            </svg>
          </div>
        </div>
        {/* Theme Toggle */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </nav>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 h-auto min-w-0 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                  <span className="text-xs font-medium sr-only">
                    {item.label}
                  </span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
