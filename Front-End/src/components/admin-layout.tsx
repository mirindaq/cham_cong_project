import type React from "react";

import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  LayoutDashboard,
  Users,
  MapPin,
  FileText,
  LogOut,
  Menu,
  CheckCircle,
  ClipboardCheck,
  User,
  Building2,
  CalendarClock,
  AlertCircle,
  Calendar,
  Clock,
  RotateCcw,
  CalendarDays,
  CalendarSync,
  Newspaper,
  Globe,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const { logout, user } = useAuth();
  const navigation: NavigationItem[] = [
    { name: "Tổng quan", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Nhân viên", href: "/admin/users", icon: Users },
    { name: "Phòng ban", href: "/admin/departments", icon: Building2 },
    {
      name: "Phân công ca làm việc",
      href: "/admin/shiff-assignment",
      icon: CalendarClock,
    },
    { name: "Vị trí", href: "/admin/locations", icon: MapPin },
    // { name: "Phê duyệt", href: "/admin/approvals", icon: ClipboardList },
    {
      name: "Đơn khiếu nại chấm công",
      href: "/admin/complaint-approvals",
      icon: AlertCircle,
    },
    { name: "Đơn nghỉ phép", href: "/admin/leave-approvals", icon: Calendar },
    {
      name: "Đơn đăng ký parttime",
      href: "/admin/part-time-approvals",
      icon: Clock,
    },
    {
      name: "Đơn xin đi làm lại",
      href: "/admin/revert-leave-approvals",
      icon: RotateCcw,
    },
    {
      name: "Đơn xin đổi ca làm",
      href: "/admin/shift-change-approvals",
      icon: CalendarSync,
    },
    {
      name: "Đơn xin làm từ xa",
      href: "/admin/remote-work-approvals",
      icon: Globe,
    },
    {
      name: "Quản lý số ngày nghỉ phép",
      href: "/admin/leave-balance",
      icon: CalendarDays,
    },
    { name: "Chấm công", href: "/admin/attendances", icon: ClipboardCheck },
    { name: "Báo cáo", href: "/admin/reports", icon: FileText },
    { name: "Tin tức", href: "/admin/news", icon: Newspaper },
    { name: "Hồ sơ cá nhân", href: "/admin/profile", icon: User },
  ];
  const isActive = (path: string): boolean => {
    return pathname === path;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="px-10  flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <nav className="flex flex-col gap-4 py-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">AttendanceTracker</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-10 w-10 transition-opacity group-hover:opacity-80">
                    <AvatarImage
                      src={
                        user?.avatar || "/placeholder.svg?height=80&width=80"
                      }
                      alt={user?.fullName}
                    />
                    <AvatarFallback>
                      {user?.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.fullName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem asChild>
                  <Link to="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <div
                    onClick={() => {
                      logout();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 lg:block sticky top-16 h-[calc(100vh-4rem)]">
          <nav className="flex flex-col gap-2 p-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
