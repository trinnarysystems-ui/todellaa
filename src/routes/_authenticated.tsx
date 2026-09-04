import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Sun, Moon } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { NotificationsBell } from "@/components/notifications-bell";
import { AIAssistant } from "@/components/ai-assistant";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading, profile, organization } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background transition-colors duration-200">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center gap-3 border-b bg-card px-6 sticky top-0 z-10 shadow-sm transition-colors duration-200">
            <SidebarTrigger className="hover:bg-muted" />
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <NotificationsBell />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
                className="h-9 w-9 rounded-full"
                aria-label="Toggle Theme"
              >
                {theme === "light" ? (
                  <Moon className="h-4.5 w-4.5 text-muted-foreground" />
                ) : (
                  <Sun className="h-4.5 w-4.5 text-yellow-400" />
                )}
              </Button>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <div className="hidden sm:flex flex-col items-end leading-none text-right">
                <span className="text-sm font-extrabold text-[#010101] dark:text-white">{profile?.full_name ?? "User"}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-300 mt-1 font-medium">{organization?.name ?? "Personal Workspace"}</span>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background transition-colors duration-200 relative">
            <Outlet />
            <AIAssistant />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
