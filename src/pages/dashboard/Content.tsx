import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyPodcasts, useCreatePodcast, useUpdatePodcast, useDeletePodcast, slugify, Podcast } from "@/hooks/usePodcasts";
import { useMyEpisodes, useCreateEpisode, useUpdateEpisode, useDeleteEpisode, Episode } from "@/hooks/useEpisodes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Mic2, Edit, Trash2, ExternalLink, Upload, Loader2, Image as ImageIcon, Link2, FileVideo } from "lucide-react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "@/lib/categories";

export default function Content() {
  const { user } = useAuth();
  const { data: podcasts = [], isLoading } = useMyPodcasts();
  const [activePodcastId, setActivePodcastId] = useState<string | undefined>();
  const [podcastDialog, setPodcastDialog] = useState<{ open: boolean; editing?: Podcast }>({ open: false });
  const [episodeDialog, setEpisodeDialog] = useState<{ open: boolean; podcastId?: string; editing?: Episode }>({ open: false });

  const activePodcast = podcasts.find((p) => p.id === activePodcastId) ?? podcasts[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl lg:text-4xl text-foreground">Content</h1>
          <p className="mt-1 text-muted-foreground">Create podcasts, upload episodes, and manage what's published.</p>
        </div>
        <Button onClick={() => setPodcastDialog({ open: true })} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold">
          <Plus className="w-4 h-4 mr-1" /> New podcast
        </Button>
      </header>

      {isLoading ? (
        <Card className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></Card>
      ) : podcasts.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl border-dashed">
          <div className="w-14 h-14 mx-auto rounded-2xl gradient-gold flex items-center justify-center mb-4">
            <Mic2 className="w-6 h-6 text-primary" />
          </div>
          <h2 className="font-display font-bold text-xl">Create your first podcast</h2>
          <p className="text-muted-foreground mt-1 mb-4">A podcast is your show. Episodes live inside it.</p>
          <Button onClick={() => setPodcastDialog({ open: true })} className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="w-4 h-4 mr-1" /> New podcast</Button>
        </Card>
      ) : (
        <Tabs value={activePodcast?.id} onValueChange={setActivePodcastId} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto bg-secondary/40 p-1">
            {podcasts.map((p) => (
              <TabsTrigger key={p.id} value={p.id} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                {p.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {podcasts.map((p) => (
            <TabsContent key={p.id} value={p.id} className="space-y-6">
              <PodcastHeader podcast={p} onEdit={() => setPodcastDialog({ open: true, editing: p })} />
              <EpisodesList
                podcastId={p.id}
                onNew={() => setEpisodeDialog({ open: true, podcastId: p.id })}
                onEdit={(ep) => setEpisodeDialog({ open: true, podcastId: p.id, editing: ep })}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}

      {podcastDialog.open && user && (
        <PodcastDialog
          userId={user.id}
          editing={podcastDialog.editing}
          onClose={() => setPodcastDialog({ open: false })}
        />
      )}
      {episodeDialog.open && user && episodeDialog.podcastId && (
        <EpisodeDialog
          userId={user.id}
          podcastId={episodeDialog.podcastId}
          editing={episodeDialog.editing}
          onClose={() => setEpisodeDialog({ open: false })}
        />
      )}
    </div>
  );
}

function PodcastHeader({ podcast, onEdit }: { podcast: Podcast; onEdit: () => void }) {
  const del = useDeletePodcast();
  return (
    <Card className="p-5 rounded-2xl flex items-center gap-5">
      {podcast.cover_url ? (
        <img src={podcast.cover_url} alt="" className="w-20 h-20 rounded-xl object-cover" />
      ) : (
        <div className="w-20 h-20 rounded-xl gradient-gold flex items-center justify-center"><Mic2 className="w-7 h-7 text-primary" /></div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="font-display font-bold text-2xl text-foreground truncate">{podcast.title}</h2>
          {podcast.is_published ? <Badge className="bg-success/20 text-success border-success/30">Published</Badge> : <Badge variant="outline">Hidden</Badge>}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1">{podcast.description || "No description"}</p>
        <p className="text-xs text-muted-foreground mt-1">/c/{podcast.slug}</p>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm"><Link to={`/c/${podcast.slug}`} target="_blank"><ExternalLink className="w-3.5 h-3.5 mr-1" /> View</Link></Button>
        <Button variant="outline" size="sm" onClick={onEdit}><Edit className="w-3.5 h-3.5 mr-1" /> Edit</Button>
        <Button variant="outline" size="sm" onClick={() => { if (confirm("Delete this podcast and all its episodes?")) del.mutate(podcast.id, { onSuccess: () => toast.success("Podcast deleted") }); }}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}

function EpisodesList({ podcastId, onNew, onEdit }: { podcastId: string; onNew: () => void; onEdit: (ep: Episode) => void }) {
  const { data: episodes = [], isLoading } = useMyEpisodes(podcastId);
  const del = useDeleteEpisode();
  const upd = useUpdateEpisode();

  return (
    <Card className="p-5 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg">Episodes</h3>
        <Button onClick={onNew} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="w-4 h-4 mr-1" /> New episode</Button>
      </div>
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      ) : episodes.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No episodes yet. Click "New episode" to add one.</p>
      ) : (
        <div className="space-y-2">
          {episodes.map((ep) => (
            <div key={ep.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/40 transition-colors">
              <div className="w-12 h-12 rounded-lg gradient-gold flex items-center justify-center shrink-0"><Mic2 className="w-5 h-5 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground truncate">{ep.title}</p>
                  {ep.is_premium && <Badge className="bg-accent/20 text-accent border-accent/30">Premium</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {ep.status === "published" ? "Published" : ep.status === "scheduled" ? `Scheduled · ${new Date(ep.scheduled_at!).toLocaleString()}` : "Draft"}
                  {" · "}{ep.hosting === "native" ? "Native" : (ep.embed_provider || "Embed")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Switch
                    checked={ep.status === "published"}
                    onCheckedChange={(checked) => upd.mutate({ id: ep.id, updates: { status: checked ? "published" : "draft", published_at: checked ? new Date().toISOString() : null } }, { onSuccess: () => toast.success(checked ? "Published" : "Unpublished") })}
                  />
                  <span className="text-xs text-muted-foreground hidden md:inline">Live</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => onEdit(ep)}><Edit className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="outline" onClick={() => { if (confirm("Delete this episode?")) del.mutate(ep.id, { onSuccess: () => toast.success("Deleted") }); }}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function PodcastDialog({ userId, editing, onClose }: { userId: string; editing?: Podcast; onClose: () => void }) {
  const [title, setTitle] = useState(editing?.title || "");
  const [slug, setSlug] = useState(editing?.slug || "");
  const [description, setDescription] = useState(editing?.description || "");
  const [category, setCategory] = useState(editing?.category || "");
  const [coverUrl, setCoverUrl] = useState(editing?.cover_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const create = useCreatePodcast();
  const update = useUpdatePodcast();

  const onUpload = async (file: File) => {
    setUploading(true);
    const path = `${userId}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error } = await supabase.storage.from("podcast-covers").upload(path, file, { upsert: false });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("podcast-covers").getPublicUrl(path);
    setCoverUrl(data.publicUrl);
    setUploading(false);
  };

  const submit = async () => {
    if (!title.trim()) { toast.error("Title required"); return; }
    setSaving(true);
    const finalSlug = slug.trim() || slugify(title);
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, updates: { title, slug: finalSlug, description, category, cover_url: coverUrl || null } });
        toast.success("Podcast updated");
      } else {
        await create.mutateAsync({ owner_id: userId, title, slug: finalSlug, description, category, cover_url: coverUrl || null });
        toast.success("Podcast created");
      }
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit podcast" : "New podcast"}</DialogTitle>
          <DialogDescription>This is your show. Episodes will live inside it.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => { setTitle(e.target.value); if (!editing) setSlug(slugify(e.target.value)); }} />
          </div>
          <div>
            <Label>URL slug</Label>
            <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="my-podcast" />
            <p className="text-xs text-muted-foreground mt-1">Public URL: /c/{slug || "your-slug"}</p>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category || undefined} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Pick a category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>{c.emoji} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Helps listeners discover your show on the Discover page.</p>
          </div>
          <div>
            <Label>Cover image</Label>
            <div className="flex items-center gap-3 mt-1">
              {coverUrl && <img src={coverUrl} alt="" className="w-14 h-14 rounded-lg object-cover" />}
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-secondary cursor-pointer text-sm">
                <Upload className="w-4 h-4" /> {uploading ? "Uploading…" : "Upload cover"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} disabled={uploading} />
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}{editing ? "Save changes" : "Create podcast"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EpisodeDialog({ userId, podcastId, editing, onClose }: { userId: string; podcastId: string; editing?: Episode; onClose: () => void }) {
  const [title, setTitle] = useState(editing?.title || "");
  const [slug, setSlug] = useState(editing?.slug || "");
  const [description, setDescription] = useState(editing?.description || "");
  const [hosting, setHosting] = useState<"native" | "embed">(editing?.hosting || "native");
  const [mediaUrl, setMediaUrl] = useState(editing?.media_url || "");
  const [mediaKind, setMediaKind] = useState(editing?.media_kind || "audio");
  const [embedProvider, setEmbedProvider] = useState<string>(editing?.embed_provider || "youtube");
  const [embedUrl, setEmbedUrl] = useState(editing?.embed_url || "");
  const [coverUrl, setCoverUrl] = useState(editing?.cover_url || "");
  const [coverUploading, setCoverUploading] = useState(false);
  const [isPremium, setIsPremium] = useState(editing?.is_premium || false);
  const [status, setStatus] = useState<"draft" | "scheduled" | "published">((editing?.status as "draft" | "scheduled" | "published") || "draft");
  const [scheduledAt, setScheduledAt] = useState(editing?.scheduled_at ? new Date(editing.scheduled_at).toISOString().slice(0, 16) : "");
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploadMsg, setUploadMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const create = useCreateEpisode();
  const update = useUpdateEpisode();

  const onUpload = async (file: File) => {
    setUploading(true);
    setUploadPct(0);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setUploadMsg(`Preparing ${sizeMb} MB…`);
    setMediaKind(file.type.startsWith("video/") ? "video" : "audio");
    const path = `${userId}/${podcastId}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    try {
      const { data: signed, error: signErr } = await supabase.storage
        .from("episode-media")
        .createSignedUploadUrl(path);
      if (signErr || !signed) throw signErr || new Error("Could not create upload URL");

      setUploadMsg(`Uploading ${sizeMb} MB…`);
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signed.signedUrl, true);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.setRequestHeader("x-upsert", "false");
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setUploadPct(Math.round((ev.loaded / ev.total) * 100));
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });

      const { data } = supabase.storage.from("episode-media").getPublicUrl(path);
      setMediaUrl(data.publicUrl);
      setUploadPct(100);
      toast.success("Upload complete");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
      setUploadMsg("");
    }
  };

  const onCoverUpload = async (file: File) => {
    setCoverUploading(true);
    const path = `${userId}/${podcastId}/thumb-${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error } = await supabase.storage.from("podcast-covers").upload(path, file, { upsert: false, contentType: file.type });
    if (error) { toast.error(error.message); setCoverUploading(false); return; }
    const { data } = supabase.storage.from("podcast-covers").getPublicUrl(path);
    setCoverUrl(data.publicUrl);
    setCoverUploading(false);
  };

  const submit = async () => {
    if (!title.trim()) { toast.error("Title required"); return; }
    if (hosting === "embed" && !embedUrl.trim()) { toast.error("Paste a YouTube/Spotify URL"); return; }
    if (hosting === "native" && !mediaUrl.trim()) { toast.error("Upload an audio or video file"); return; }
    setSaving(true);
    const finalSlug = slug.trim() || slugify(title);
    const payload = {
      podcast_id: podcastId,
      owner_id: userId,
      title,
      slug: finalSlug,
      description,
      hosting,
      cover_url: coverUrl || null,
      media_url: hosting === "native" ? mediaUrl || null : null,
      media_kind: hosting === "native" ? mediaKind : null,
      embed_provider: hosting === "embed" ? (embedProvider as "youtube" | "spotify" | "apple" | "soundcloud" | "other") : null,
      embed_url: hosting === "embed" ? embedUrl || null : null,
      is_premium: isPremium,
      status,
      scheduled_at: status === "scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
      published_at: status === "published" ? (editing?.published_at || new Date().toISOString()) : null,
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, updates: payload });
        toast.success("Episode updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Episode created");
      }
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit episode" : "New episode"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => { setTitle(e.target.value); if (!editing) setSlug(slugify(e.target.value)); }} />
          </div>
          <div>
            <Label>URL slug</Label>
            <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div>
            <Label>How will you provide the episode?</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setHosting("native")}
                className={`p-3 rounded-xl border text-left transition-all ${hosting === "native" ? "border-accent bg-accent/10" : "border-border hover:border-accent/40"}`}
              >
                <FileVideo className="w-5 h-5 text-accent mb-1" />
                <p className="font-semibold text-sm">Upload from device</p>
                <p className="text-xs text-muted-foreground">Audio or video file</p>
              </button>
              <button
                type="button"
                onClick={() => setHosting("embed")}
                className={`p-3 rounded-xl border text-left transition-all ${hosting === "embed" ? "border-accent bg-accent/10" : "border-border hover:border-accent/40"}`}
              >
                <Link2 className="w-5 h-5 text-accent mb-1" />
                <p className="font-semibold text-sm">Paste a link</p>
                <p className="text-xs text-muted-foreground">YouTube, Spotify, etc.</p>
              </button>
            </div>
          </div>
          {hosting === "native" ? (
            <div>
              <Label>Media file (audio or video, no size limit)</Label>
              <div className="flex items-center gap-3 mt-1">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-secondary cursor-pointer text-sm">
                  <Upload className="w-4 h-4" /> {uploading ? "Uploading…" : mediaUrl ? "Replace file" : "Upload file"}
                  <input type="file" accept="audio/*,video/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} disabled={uploading} />
                </label>
                {mediaUrl && <span className="text-xs text-success">✓ uploaded ({mediaKind})</span>}
              </div>
            </div>
          ) : (
            <>
              <div>
                <Label>Provider</Label>
                <Select value={embedProvider} onValueChange={setEmbedProvider}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="spotify">Spotify</SelectItem>
                    <SelectItem value="apple">Apple Podcasts</SelectItem>
                    <SelectItem value="soundcloud">SoundCloud</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Episode link</Label>
                <Input value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                <p className="text-xs text-muted-foreground mt-1">Resona will pull the player from this URL.</p>
              </div>
            </>
          )}
          <div>
            <Label>Thumbnail (optional)</Label>
            <div className="flex items-center gap-3 mt-1">
              {coverUrl ? (
                <img src={coverUrl} alt="thumb" className="w-14 h-14 rounded-lg object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center"><ImageIcon className="w-5 h-5 text-muted-foreground" /></div>
              )}
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-secondary cursor-pointer text-sm">
                <Upload className="w-4 h-4" /> {coverUploading ? "Uploading…" : coverUrl ? "Replace thumbnail" : "Upload thumbnail"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onCoverUpload(e.target.files[0])} disabled={coverUploading} />
              </label>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <Label className="m-0">Premium episode</Label>
              <p className="text-xs text-muted-foreground">Only paying subscribers can listen.</p>
            </div>
            <Switch checked={isPremium} onCheckedChange={setIsPremium} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "scheduled" | "published")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {status === "scheduled" && (
            <div>
              <Label>Scheduled for</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}{editing ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
