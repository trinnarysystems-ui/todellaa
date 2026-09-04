import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Bell, CheckCheck, Loader2, Sparkles, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function NotificationsBell() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", organization?.id],
    enabled: !!organization?.id,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("notifications")
        .select("*")
        .eq("organization_id", organization!.id)
        .order("created_at", { ascending: false })
        .limit(10);
      return (data as any[]) ?? [];
    },
  });

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  useEffect(() => {
    if (!organization?.id) return;

    // Real-time subscription for instant database flags
    const channel = supabase
      .channel(`notifications-org-${organization.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `organization_id=eq.${organization.id}`,
        },
        (payload) => {
          queryClient.setQueryData(
            ["notifications", organization.id],
            (old: any[] = []) => [payload.new, ...old].slice(0, 10)
          );
          toast(payload.new.title, {
            description: payload.new.message,
            icon: <Bell className="h-4 w-4 text-[#e8562a]" />,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organization?.id, queryClient]);

  const markAllRead = async () => {
    if (!organization?.id || unreadCount === 0) return;
    
    // Optimistic update
    queryClient.setQueryData(
      ["notifications", organization.id],
      (old: any[] = []) => old.map((n: any) => ({ ...n, is_read: true }))
    );

    const { error } = await (supabase as any)
      .from("notifications")
      .update({ is_read: true })
      .eq("organization_id", organization.id)
      .eq("is_read", false);

    if (error) {
      toast.error("Failed to update notifications");
      queryClient.invalidateQueries({ queryKey: ["notifications", organization.id] });
    } else {
      toast.success("All marked as read");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "mismatch":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "duplicate":
        return <AlertCircle className="h-4 w-4 text-rose-500" />;
      case "refund_alert":
        return <RefreshCw className="h-4 w-4 text-[#e8562a]" />;
      default:
        return <Sparkles className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-muted/80 text-muted-foreground transition-all duration-200"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e8562a] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e8562a]"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0 border-border/60 bg-card/95 backdrop-blur-xl shadow-[var(--shadow-elegant)] rounded-2xl overflow-hidden transition-all duration-300">
        <div className="flex items-center justify-between border-b border-border/40 p-4 bg-muted/20">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[10px] bg-[#e8562a]/10 text-[#e8562a] border-[#e8562a]/20 font-black">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              className="text-xs hover:text-foreground text-muted-foreground font-semibold px-2 rounded-full gap-1 h-7 cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-72">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-xs font-semibold">Syncing alerts...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4 className="mt-3 text-xs font-bold text-foreground">All clear!</h4>
              <p className="mt-1 text-[11px] text-muted-foreground max-w-[200px]">
                No payment discrepancies or warnings logged in your workspace.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3.5 p-4 transition-colors duration-150 hover:bg-muted/10 ${
                    !n.is_read ? "bg-[#e8562a]/[0.02]" : ""
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border ${
                      !n.is_read 
                        ? "bg-muted border-border/80" 
                        : "bg-muted/30 border-border/40"
                    }`}>
                      {getIcon(n.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs truncate ${!n.is_read ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      <span className="text-[9px] text-muted-foreground/60 shrink-0 font-medium">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground/90 mt-1 leading-relaxed break-words font-medium">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="border-t border-border/40 p-2.5 bg-muted/10 text-center">
          <Link
            to="/notifications"
            className="inline-flex w-full justify-center py-2 text-xs font-extrabold text-primary hover:text-primary/90 transition-colors"
          >
            View All Notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
