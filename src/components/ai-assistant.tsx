import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Send, Loader2, Bot, User, Download, FileText, 
  X, HelpCircle, MessageSquare, Trash2 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, 
  Tooltip as ChartTooltip, CartesianGrid, PieChart, Pie, Cell 
} from "recharts";
import Papa from "papaparse";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:5000";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  chart?: {
    type: "bar" | "line" | "pie";
    xKey: string;
    yKey: string;
    data: any[];
  };
  queryAttempted?: string;
}

const SUGGESTIONS = [
  "Show today's payments",
  "Which invoices are overdue?",
  "How much revenue did we collect this month?",
  "Show unpaid customers"
];

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function AIAssistant() {
  const { organization, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    if (!organization?.id) return;
    const cacheKey = `todella_ai_chat_history_${organization.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setMessages(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached chat history", e);
      }
    } else {
      // Default initial assistant greeting
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hello ${profile?.full_name || "there"}! I am your Business Assistant. Ask me anything about payments, invoices, customers, or reports in your organization.`,
          timestamp: new Date().toISOString(),
        }
      ]);
    }
  }, [organization?.id, profile?.full_name]);

  // Save chat history to localStorage
  const saveMessages = (updated: Message[]) => {
    setMessages(updated);
    if (organization?.id) {
      const cacheKey = `todella_ai_chat_history_${organization.id}`;
      localStorage.setItem(cacheKey, JSON.stringify(updated));
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, loading, open]);

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || !organization?.id) return;

    if (!textToSend) setInput("");

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: queryText,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    saveMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: organization.id,
          message: queryText,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: resData.data.message,
          timestamp: new Date().toISOString(),
          chart: resData.data.chart,
          queryAttempted: resData.data.queryAttempted,
        };
        saveMessages([...newMessages, aiMsg]);
      } else {
        throw new Error(resData.error || "Unknown assistant engine failure");
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: `ai-err-${Date.now()}`,
        role: "assistant",
        content: `Sorry, I encountered an error running that query: **${err.message || err}**. Please verify the server connection and try again.`,
        timestamp: new Date().toISOString(),
      };
      saveMessages([...newMessages, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (!organization?.id) return;
    const initial: Message[] = [
      {
        id: "welcome",
        role: "assistant",
        content: `Chat history cleared. I am ready for your next query!`,
        timestamp: new Date().toISOString(),
      }
    ];
    saveMessages(initial);
  };

  const exportCSV = (chart: any, title: string) => {
    if (!chart?.data || chart.data.length === 0) return;
    const csvContent = Papa.unparse(chart.data);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = (content: string, title: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Convert basic markdown tags to simple styled HTML
    const formattedHtml = content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code style='background-color:#f3f4f6;padding:2px 4px;border-radius:4px;'>$1</code>")
      .replace(/\n/g, "<br/>")
      .replace(/- (.*?)(<br\/>|$)/g, "<li>$1</li>");

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #374151; line-height: 1.6; }
            .container { max-width: 800px; margin: 0 auto; }
            h1 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; font-size: 24px; font-weight: 800; }
            strong { color: #111827; }
            li { margin-bottom: 6px; }
            .footer { margin-top: 60px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${title}</h1>
            <div>${formattedHtml}</div>
            <div class="footer">
              <span>Generated by Todella Business Intelligence Assistant</span>
              <span>Date: ${new Date().toLocaleDateString()}</span>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Simple Markdown Parsing helper
  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let content = line;
      
      // Bold text **word**
      content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      // Italic text *word*
      content = content.replace(/\*(.*?)\*/g, "<em>$1</em>");
      // Inline code `code`
      content = content.replace(/`([^`]+)`/g, "<code class='bg-muted px-1 py-0.5 rounded text-xs font-mono'>$1</code>");

      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <li 
            key={idx} 
            className="ml-4 list-disc text-sm text-foreground/90 mt-1" 
            dangerouslySetInnerHTML={{ __html: content.substring(2) }} 
          />
        );
      }

      if (line.trim().startsWith("### ")) {
        return (
          <h4 
            key={idx} 
            className="text-sm font-bold text-foreground mt-4 mb-1" 
            dangerouslySetInnerHTML={{ __html: content.substring(4) }} 
          />
        );
      }

      if (line.trim().startsWith("## ")) {
        return (
          <h3 
            key={idx} 
            className="text-base font-bold text-foreground mt-5 mb-2 border-b pb-1" 
            dangerouslySetInnerHTML={{ __html: content.substring(3) }} 
          />
        );
      }

      if (line.trim().startsWith("# ")) {
        return (
          <h2 
            key={idx} 
            className="text-lg font-extrabold text-foreground mt-6 mb-3" 
            dangerouslySetInnerHTML={{ __html: content.substring(2) }} 
          />
        );
      }

      if (line.trim() === "") return <div key={idx} className="h-2" />;

      return (
        <p 
          key={idx} 
          className="text-sm text-foreground/90 leading-relaxed mt-1" 
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      );
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Floating Action Button */}
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 shadow-2xl bg-linear-to-tr from-[#e8562a] to-[#f06e42] hover:from-[#d44820] hover:to-[#e8562a] text-white rounded-full z-40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          aria-label="Open Assistant"
        >
          <Sparkles className="h-6 w-6 animate-pulse" />
        </Button>
      </SheetTrigger>

      {/* Slide-out Panel */}
      <SheetContent className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full bg-card/95 backdrop-blur-xl border-l border-border/80 shadow-2xl">
        <SheetHeader className="p-4 border-b bg-linear-to-r from-[#e8562a]/10 to-[#f06e42]/5 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-linear-to-tr from-[#e8562a] to-[#f06e42] flex items-center justify-center text-white shadow-md">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <SheetTitle className="text-base font-extrabold font-sans leading-none flex items-center gap-1.5">
                Todella Assistant
                <Badge variant="outline" className="text-[9px] py-0.5 px-1.5 bg-orange-50 dark:bg-orange-950/30 text-[#e8562a] dark:text-[#f06e42] border-orange-200 dark:border-orange-800/40 rounded-full font-black uppercase tracking-wider">Live BI</Badge>
              </SheetTitle>
              <p className="text-[10px] text-muted-foreground mt-1">Ask questions in natural language</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={clearChat}
            title="Clear Chat History"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </SheetHeader>

        {/* Messages Body */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                {/* Avatar Icon */}
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === "assistant" 
                    ? "bg-linear-to-tr from-[#e8562a] to-[#f06e42] text-white" 
                    : "bg-muted text-muted-foreground border"
                }`}>
                  {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`space-y-3 rounded-2xl p-3.5 shadow-sm text-sm border transition-all duration-200 ${
                  msg.role === "assistant" 
                    ? "bg-card text-foreground border-border/80 rounded-tl-none" 
                    : "bg-[#e8562a] text-white border-[#e8562a] rounded-tr-none"
                }`}>
                  <div>{msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}</div>

                  {/* PDF/CSV Report Actions */}
                  {msg.role === "assistant" && msg.id !== "welcome" && (
                    <div className="flex flex-wrap gap-2 mt-3.5 pt-3 border-t border-border/40">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[10px] h-7 px-2.5 font-bold rounded-lg border-border/80 hover:bg-muted cursor-pointer"
                        onClick={() => exportPDF(msg.content, "AI Financial Analytics Summary")}
                      >
                        <FileText className="h-3 w-3 mr-1 text-[#e8562a]" /> Print Summary
                      </Button>
                    </div>
                  )}

                  {/* Dev Debug info */}
                  {msg.queryAttempted && (
                    <div className="text-[9px] text-muted-foreground/80 font-mono tracking-tight mt-1 flex items-center gap-1">
                      <HelpCircle className="h-2.5 w-2.5" /> Source: {msg.queryAttempted}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="h-8 w-8 rounded-lg bg-linear-to-tr from-[#e8562a] to-[#f06e42] text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-card text-foreground border border-border/85 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 shadow-sm text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-[#e8562a]" />
                  <span className="text-muted-foreground font-medium">Scanning organization ledger...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggestions Bar */}
        {messages.length <= 1 && !loading && (
          <div className="px-4 pb-2 pt-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Suggested queries</p>
            <div className="flex flex-col gap-1.5">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="text-left text-xs bg-muted/65 hover:bg-muted border border-border/50 hover:border-orange-200/50 p-2.5 rounded-xl text-foreground font-medium transition-all duration-150 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Chat Input */}
        <div className="p-4 border-t bg-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Ask anything e.g. Show today's payments..."
              className="flex-1 h-10 px-3.5 bg-muted/50 focus:bg-muted border border-border/60 focus:border-[#e8562a]/80 rounded-xl text-sm focus:outline-none transition-all duration-200 disabled:opacity-50"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || loading}
              className="h-10 w-10 bg-linear-to-tr from-[#e8562a] to-[#f06e42] hover:from-[#d44820] hover:to-[#e8562a] text-white rounded-xl shadow-md hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
