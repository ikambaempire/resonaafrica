import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Puzzle, Youtube, Music, Mic, Apple, ExternalLink, Rss, Copy, Loader2, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMyPodcasts, useCreatePodcast, slugify } from "@/hooks/usePodcasts";
import { useAuth } from "@/contexts/AuthContext";

const guides = [
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "text-red-500",
    blurb: "Publish video podcasts to YouTube and embed any video back into Resona.",
    steps: [
      "Open your video on YouTube and copy the URL (e.g. https://www.youtube.com/watch?v=ID).",
      "In Resona, go to Content → New episode → choose 'Paste a link' → Provider: YouTube.",
      "Paste the URL and Resona pulls the player automatically.",
      "Add a thumbnail and publish — your audience can watch directly on your channel page.",
    ],
    link: { label: "Open YouTube Studio", href: "https://studio.youtube.com" },
  },
  {
    id: "spotify",
    name: "Spotify for Podcasters",
    icon: Music,
    color: "text-green-500",
    blurb: "Distribute audio episodes to Spotify and mirror them inside Resona.",
    steps: [
      "Submit your show RSS to Spotify for Podcasters (one-time setup).",
      "Once an episode is live, copy the share URL from the Spotify episode page.",
      "In Resona: New episode → Paste a link → Provider: Spotify, paste the URL.",
      "Resona renders the official Spotify player on your channel page.",
    ],
    link: { label: "Open Spotify for Podcasters", href: "https://podcasters.spotify.com" },
  },
  {
    id: "apple",
    name: "Apple Podcasts",
    icon: Apple,
    color: "text-foreground",
    blurb: "Reach Apple listeners by submitting your Resona RSS feed once.",
    steps: [
      "Set your podcast to 'Published' in Resona — this generates a public RSS feed.",
      "Copy your channel RSS URL: https://amplifyafrica.lovable.app/c/YOUR-SLUG/rss.xml",
      "Open Apple Podcasts Connect and submit the feed (free Apple ID required).",
      "Approval typically takes 24–72 hours; new episodes auto-sync.",
    ],
    link: { label: "Open Apple Podcasts Connect", href: "https://podcastsconnect.apple.com" },
  },
  {
    id: "soundcloud",
    name: "SoundCloud",
    icon: Mic,
    color: "text-orange-500",
    blurb: "Mirror audio episodes from SoundCloud into Resona.",
    steps: [
      "Upload your episode to SoundCloud and grab the track URL.",
      "In Resona: New episode → Paste a link → Provider: SoundCloud.",
      "Paste the URL — the SoundCloud waveform player appears on your channel.",
    ],
    link: { label: "Open SoundCloud", href: "https://soundcloud.com/upload" },
  },
];

export default function Integrations() {
  const rssUrl = `${window.location.origin}/c/YOUR-SLUG/rss.xml`;
  const { data: podcasts = [], refetch: refetchPodcasts } = useMyPodcasts();
  const createPodcast = useCreatePodcast();
  const { user } = useAuth();

  const [channelInput, setChannelInput] = useState("");
  const [podcastId, setPodcastId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [channel, setChannel] = useState<{ channelId: string; title: string; handle?: string } | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  async function fetchVideos() {
    if (!channelInput.trim()) return toast.error("Paste a YouTube channel URL or @handle");
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("import-youtube-channel", {
        body: { action: "list", channelInput },
      });
      if (error) throw error;
      if (!data?.channel) throw new Error(data?.error || "Could not load channel");
      setChannel(data.channel);
      setVideos(data.videos || []);
      const sel: Record<string, boolean> = {};
      (data.videos || []).forEach((v: any) => { sel[v.videoId] = true; });
      setSelected(sel);
      toast.success(`Found ${data.videos?.length || 0} videos on ${data.channel.title}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to load channel");
    } finally { setBusy(false); }
  }

  async function importSelected() {
    if (!podcastId) return toast.error("Pick a podcast to import into");
    const picked = videos.filter((v) => selected[v.videoId]);
    if (!picked.length) return toast.error("Select at least one video");
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("import-youtube-channel", {
        body: { action: "import", podcastId, channelId: channel!.channelId, handle: channel!.handle, videos: picked },
      });
      if (error) throw error;
      toast.success(`Imported ${data?.inserted ?? picked.length} episodes`);
      setVideos([]); setChannel(null); setChannelInput("");
    } catch (e: any) {
      toast.error(e.message || "Import failed");
    } finally { setBusy(false); }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="font-display font-bold text-3xl lg:text-4xl flex items-center gap-3">
          <Puzzle className="w-8 h-8 text-accent" /> Integrations
        </h1>
        <p className="mt-1 text-muted-foreground max-w-2xl">
          Connect Resona Africa to YouTube, Spotify, Apple Podcasts and SoundCloud. Two paths: paste a link to embed any episode instantly, or distribute your Resona feed everywhere.
        </p>
      </header>

      {/* YouTube one-click import wizard */}
      <Card className="p-6 rounded-2xl border-red-500/30 bg-red-500/[0.03]">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center"><Youtube className="w-5 h-5 text-red-500" /></div>
          <div>
            <h2 className="font-display font-bold text-lg">YouTube — one-click channel import</h2>
            <p className="text-sm text-muted-foreground">Paste your channel URL or @handle and pull in the latest 25 videos as episodes. View counts sync hourly.</p>
          </div>
        </div>

        {!channel && (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-[1fr_auto] gap-2">
              <Input
                placeholder="https://youtube.com/@yourhandle  or  UCxxxxxxxxxxxxxxxx"
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
              />
              <Button onClick={fetchVideos} disabled={busy} className="bg-red-500 text-white hover:bg-red-600">
                {busy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Youtube className="w-4 h-4 mr-1" />}
                Fetch videos
              </Button>
            </div>
          </div>
        )}

        {channel && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="px-3 py-1 rounded-full bg-secondary"><strong>{channel.title}</strong></span>
              <span className="text-muted-foreground">{videos.length} videos found</span>
              <Button size="sm" variant="ghost" onClick={() => { setChannel(null); setVideos([]); }}>Change channel</Button>
            </div>

            <div>
              <Label className="text-xs">Import into podcast</Label>
              <select
                className="w-full mt-1 h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={podcastId}
                onChange={(e) => setPodcastId(e.target.value)}
              >
                <option value="">— Select a podcast —</option>
                {podcasts.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              {podcasts.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  No podcasts yet. <Link to="/dashboard/content" className="text-accent underline">Create one first</Link>.
                </p>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto rounded-xl border border-border divide-y divide-border">
              {videos.map((v) => (
                <label key={v.videoId} className="flex items-center gap-3 p-2 hover:bg-secondary/40 cursor-pointer">
                  <Checkbox checked={!!selected[v.videoId]} onCheckedChange={(c) => setSelected((s) => ({ ...s, [v.videoId]: !!c }))} />
                  {v.thumbnail && <img src={v.thumbnail} alt="" className="w-20 h-12 rounded object-cover" loading="lazy" />}
                  <span className="flex-1 text-sm line-clamp-2">{v.title}</span>
                </label>
              ))}
            </div>

            <Button onClick={importSelected} disabled={busy || !podcastId} className="bg-red-500 text-white hover:bg-red-600">
              {busy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
              Import {Object.values(selected).filter(Boolean).length} episodes
            </Button>
          </div>
        )}
      </Card>

      {/* Quick path */}
      <Card className="p-6 rounded-2xl bg-accent/5 border-accent/30">
        <h2 className="font-display font-bold text-lg mb-2">Or paste a single link</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Inside the episode editor choose <strong className="text-foreground">"Paste a link"</strong>, pick a provider, and paste your YouTube / Spotify / SoundCloud URL. Resona pulls the official player and stats.
        </p>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full">
          <Link to="/dashboard/content">Add an episode now</Link>
        </Button>
      </Card>

      {/* RSS share */}
      <Card className="p-6 rounded-2xl">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><Rss className="w-5 h-5 text-accent" /></div>
          <div>
            <h2 className="font-display font-bold text-lg">Your Resona RSS feed</h2>
            <p className="text-sm text-muted-foreground">Submit this once to Apple Podcasts, Google Podcasts, Pocket Casts, Overcast — every directory.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <code className="flex-1 px-3 py-2 rounded-lg bg-secondary text-sm break-all">{rssUrl}</code>
          <Button variant="outline" onClick={() => { navigator.clipboard.writeText(rssUrl); toast.success("Copied"); }}>
            <Copy className="w-4 h-4 mr-1" /> Copy
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Replace YOUR-SLUG with your channel slug from Content.</p>
      </Card>

      {/* Per-platform guides */}
      <Card className="p-6 rounded-2xl">
        <h2 className="font-display font-bold text-lg mb-4">Step-by-step platform guides</h2>
        <Accordion type="single" collapsible className="w-full">
          {guides.map((g) => (
            <AccordionItem key={g.id} value={g.id} className="border-border">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                    <g.icon className={`w-4 h-4 ${g.color}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-display font-bold">{g.name}</p>
                    <p className="text-xs text-muted-foreground font-normal">{g.blurb}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-12">
                <ol className="list-decimal space-y-2 text-sm text-muted-foreground">
                  {g.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <a href={g.link.href} target="_blank" rel="noreferrer">
                    {g.link.label} <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                </Button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
}
