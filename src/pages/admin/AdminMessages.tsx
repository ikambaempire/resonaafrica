import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Trash2, CheckCircle2, Loader2, Inbox } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
  handled_at: string | null;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setMessages((data ?? []) as ContactMessage[]);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (m: ContactMessage) => {
    const next = !m.is_read;
    const { error } = await supabase
      .from("contact_messages")
      .update({ is_read: next, handled_at: next ? new Date().toISOString() : null })
      .eq("id", m.id);
    if (error) { toast.error(error.message); return; }
    setMessages((prev) => prev.map((x) => x.id === m.id ? { ...x, is_read: next, handled_at: next ? new Date().toISOString() : null } : x));
  };

  const remove = async (m: ContactMessage) => {
    if (!confirm(`Delete message from ${m.name}?`)) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", m.id);
    if (error) { toast.error(error.message); return; }
    setMessages((prev) => prev.filter((x) => x.id !== m.id));
    toast.success("Deleted");
  };

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Admin</p>
          <h1 className="mt-2 font-display font-bold text-3xl lg:text-4xl flex items-center gap-3">
            <Inbox className="w-8 h-8 text-accent" /> Messages
            {unread > 0 && <Badge className="bg-accent text-accent-foreground">{unread} new</Badge>}
          </h1>
          <p className="mt-1 text-muted-foreground">Messages submitted from the public Contact page.</p>
        </div>
      </header>

      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : messages.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl border-dashed">
          <Mail className="w-10 h-10 text-accent mx-auto mb-3" />
          <p className="text-muted-foreground">No messages yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <Card key={m.id} className={`p-5 rounded-2xl border ${m.is_read ? "border-border/60" : "border-accent/40 bg-accent/5"}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-bold text-foreground">{m.name}</p>
                    <a href={`mailto:${m.email}`} className="text-sm text-accent hover:underline">{m.email}</a>
                    {!m.is_read && <Badge variant="outline" className="text-accent border-accent/40">Unread</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                  <p className="mt-3 text-sm text-foreground whitespace-pre-wrap leading-relaxed">{m.message}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => markRead(m)}>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    {m.is_read ? "Mark unread" : "Mark read"}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(m)}>
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
