import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutDashboard, ClipboardList, CreditCard, BarChart3, Settings, ShieldCheck, LogOut, FileText, RotateCcw, History, Wallet } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Services", url: "/services", icon: ClipboardList },
  { title: "Invoices", url: "/invoices", icon: FileText },
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Refunds", url: "/refunds", icon: RotateCcw },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Audit Logs", url: "/audit-logs", icon: History },
  { title: "Staff Directory", url: "/staff-management", icon: ShieldCheck },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Payment Providers", url: "/settings/payment-providers", icon: Wallet },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { signOut, organization, profile, role } = useAuth();

  const allowedItems = items.filter((item) => {
    if (item.url === "/staff-management" || item.url === "/settings/payment-providers") {
      return role === "super_admin" || role === "admin";
    }
    if (item.url === "/invoices" || item.url === "/refunds") {
      return role !== "viewer";
    }
    return true;
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border py-4 px-3 bg-sidebar">
        <Link to="/" className="flex items-center gap-2.5 select-none shrink-0 group">
          <svg className="w-8 h-8 shrink-0 group-hover:scale-105 transition-transform duration-200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="sidebarLogoGrad" x1="30" y1="30" x2="170" y2="170" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e8562a" />
                <stop offset="100%" stopColor="#f06e42" />
              </linearGradient>
            </defs>
            <path
              d="M40 50 C 40 50, 90 40, 160 40 C 170 40, 170 50, 160 60 C 130 90, 120 120, 105 160 C 100 170, 90 170, 85 160 C 75 140, 70 120, 75 90 Z"
              fill="url(#sidebarLogoGrad)"
            />
            <path
              d="M80 95 L105 120 L150 70"
              stroke="white"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm tracking-tight text-sidebar-foreground leading-none">
                Todellaa
              </span>
              <span className="text-[10px] text-sidebar-foreground/60 font-medium truncate mt-1">{organization?.name ?? "Workspace"}</span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/55 font-bold uppercase tracking-wider text-[10px]">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allowedItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border bg-sidebar p-2.5">
        {!collapsed && profile && (
          <div className="px-2 py-1.5 text-xs text-sidebar-foreground">
            <p className="font-bold truncate text-[11px] uppercase tracking-wider text-sidebar-foreground/50 leading-none">User</p>
            <p className="font-semibold truncate text-slate-900 mt-1">{profile.full_name} ({role})</p>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className="justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full rounded-full font-semibold text-xs" 
          onClick={() => signOut()}
        >
          <LogOut className="h-4.5 w-4.5" />
          {!collapsed && "Sign out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}