import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic2, Globe, UserPlus, UserCheck, Sparkles, Headphones } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type PublicProfile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  category: string | null;
  profile_kind: string | null;
  company: string | null;
  website: string | null;
  social_links: any;
  follower_count: number;
  podcast_count: number;
  episode_count: number;
};

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [following, setFollowing] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_public_profile", { _username: username });
      if (error) throw error;
      return (data?.[0] as PublicProfile) || null;
    },
    enabled: !!username,
  });

  const { data: podcasts = [] } = useQuery({
    queryKey: ["public-profile-podcasts", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("id, slug, title, cover_url, category, description")
        .eq("owner_id", profile!.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  const { data: episodes = [] } = useQuery({
    queryKey: ["public-profile-episodes", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes")
        .select("id, slug, title, cover_url, podcast_id, created_at")
        .eq("owner_id", profile!.id)
        .eq("status", "published")
        .eq("is_premium", false)
        .order("created_at", { ascending: false })
        .limit(24);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  useEffect(() => {
    (async () => {
      if (!user || !profile?.id) {
        setFollowing(false);
        return;
      }
      const { data } = await supabase
        .from("profile_followers")
        .select("id")
        .eq("profile_id", profile.id)
        .eq("follower_id", user.id)
        .maybeSingle();
      setFollowing(!!data);
    })();
  }, [user, profile?.id]);

  const toggleFollow = async () => {
    if (!user) {
      toast.error("Sign in to follow creators");
      return;
    }
    if (!profile) return;
    if (following) {
      await supabase.from("profile_followers").delete().eq("profile_id", profile.id).eq("follower_id", user.id);
      setFollowing(false);
    } else {
      await supabase.from("profile_followers").insert({ profile_id: profile.id, follower_id: user.id });
      setFollowing(true);
    }
    qc.invalidateQueries({ queryKey: ["public-profile", username] });
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="max-w-5xl mx-auto px-6 py-24 text-center text-muted-foreground">Loading profile…</div>
      </PageShell>
    );
  }

  if (!profile) {
    return (
      <PageShell>
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <Sparkles className="w-10 h-10 mx-auto text-accent mb-3" />
          <h1 className="font-display font-bold text-3xl">Profile not found</h1>
          <p className="mt-2 text-muted-foreground">No creator with the handle @{username}.</p>
          <Button asChild className="mt-6 rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/discover">Discover creators</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const isOwn = user?.id === profile.id;
  const KindIcon = profile.profile_kind === "studio" ? Mic2 : profile.profile_kind === "listener" ? Headphones : Sparkles;

  return (
    <PageShell>
      {/* Cover banner */}
      <div className="relative w-full h-44 sm:h-60 lg:h-72 bg-gradient-to-br from-primary via-primary to-accent/40 overflow-hidden">
        {profile.cover_url && (
          <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-background bg-secondary shrink-0 overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name ?? profile.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-display font-bold text-accent bg-accent/10">
                {(profile.full_name || profile.username || "?")[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left pb-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">{profile.full_name || profile.username}</h1>
              {profile.category && <Badge variant="secondary" className="text-xs"><KindIcon className="w-3 h-3 mr-1" />{profile.category}</Badge>}
            </div>
            <p className="text-muted-foreground text-sm mt-1">@{profile.username}</p>
          </div>

          <div className="flex gap-2 pb-2">
            {isOwn ? (
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="rounded-full">
                  <Link to="/dashboard/settings">Edit profile</Link>
                </Button>
                <Button asChild className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-gold">
                  <Link to="/dashboard/overview">Open dashboard</Link>
                </Button>
              </div>
            ) : (
              <Button
                onClick={toggleFollow}
                className={`rounded-full font-semibold ${following ? "bg-secondary text-foreground hover:bg-secondary/70" : "bg-accent text-accent-foreground hover:bg-accent/90"}`}
              >
                {following ? <><UserCheck className="w-4 h-4 mr-1.5" /> Following</> : <><UserPlus className="w-4 h-4 mr-1.5" /> Follow</>}
              </Button>
            )}
            {profile.website && (
              <Button asChild variant="outline" className="rounded-full">
                <a href={profile.website} target="_blank" rel="noreferrer"><Globe className="w-4 h-4" /></a>
              </Button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-6 max-w-md mx-auto sm:mx-0">
          {[
            { label: "Subscribers", value: profile.follower_count },
            { label: "Podcasts", value: profile.podcast_count },
            { label: "Episodes", value: profile.episode_count },
          ].map((s) => (
            <div key={s.label} className="text-center sm:text-left">
              <div className="font-display font-bold text-2xl text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {profile.bio && (
          <p className="mt-6 text-muted-foreground max-w-2xl whitespace-pre-line">{profile.bio}</p>
        )}

        <Tabs defaultValue="episodes" className="mt-10">
          <TabsList>
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="episodes" className="mt-6">
            {episodes.length === 0 ? (
              <Card className="p-10 text-center text-muted-foreground rounded-2xl">No published episodes yet.</Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {episodes.map((e: any) => (
                  <Card key={e.id} className="rounded-2xl overflow-hidden border-border/60 hover:border-accent/50 transition-colors">
                    <div className="aspect-square bg-secondary overflow-hidden">
                      {e.cover_url ? <img src={e.cover_url} alt="" loading="lazy" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Mic2 className="w-8 h-8 text-muted-foreground" /></div>}
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm text-foreground line-clamp-2">{e.title}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="podcasts" className="mt-6">
            {podcasts.length === 0 ? (
              <Card className="p-10 text-center text-muted-foreground rounded-2xl">No public podcasts yet.</Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {podcasts.map((p: any) => (
                  <Link key={p.id} to={`/c/${p.slug}`} className="block">
                    <Card className="rounded-2xl overflow-hidden border-border/60 hover:border-accent/50 transition-colors">
                      <div className="aspect-square bg-secondary overflow-hidden">
                        {p.cover_url ? <img src={p.cover_url} alt="" loading="lazy" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Mic2 className="w-8 h-8 text-muted-foreground" /></div>}
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-sm text-foreground line-clamp-2">{p.title}</p>
                        {p.category && <p className="text-xs text-muted-foreground mt-1">{p.category}</p>}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card className="p-6 rounded-2xl space-y-3">
              <div><span className="text-xs uppercase text-muted-foreground tracking-wider">Bio</span><p className="mt-1">{profile.bio || "No bio yet."}</p></div>
              {profile.company && <div><span className="text-xs uppercase text-muted-foreground tracking-wider">Company</span><p className="mt-1">{profile.company}</p></div>}
              {profile.category && <div><span className="text-xs uppercase text-muted-foreground tracking-wider">Category</span><p className="mt-1">{profile.category}</p></div>}
              {profile.website && <div><span className="text-xs uppercase text-muted-foreground tracking-wider">Website</span><p className="mt-1"><a href={profile.website} target="_blank" rel="noreferrer" className="text-accent hover:underline">{profile.website}</a></p></div>}
            </Card>
          </TabsContent>
        </Tabs>

        <div className="pb-20" />
      </div>
    </PageShell>
  );
}
