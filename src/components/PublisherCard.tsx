import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, UserCircle2 } from "lucide-react";

export function PublisherCard({ ownerId }: { ownerId?: string | null }) {
  const { data: profile } = useQuery({
    queryKey: ["publisher", ownerId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, bio, category")
        .eq("id", ownerId!)
        .maybeSingle();
      return data;
    },
    enabled: !!ownerId,
  });

  if (!profile?.username) return null;

  return (
    <Card className="p-4 rounded-2xl flex items-center gap-3 border-border/60 bg-card">
      <Link to={`/u/${profile.username}`} className="shrink-0">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.full_name ?? profile.username} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center">
            <UserCircle2 className="w-6 h-6 text-accent" />
          </div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Published by</p>
        <Link to={`/u/${profile.username}`} className="font-display font-bold text-foreground hover:text-accent transition-colors block truncate">
          {profile.full_name || profile.username}
        </Link>
        <p className="text-xs text-muted-foreground truncate">@{profile.username}{profile.category ? ` · ${profile.category}` : ""}</p>
      </div>
      <Button asChild size="sm" variant="outline" className="rounded-full shrink-0">
        <Link to={`/u/${profile.username}`}>View profile <ArrowUpRight className="w-3.5 h-3.5 ml-1" /></Link>
      </Button>
    </Card>
  );
}
