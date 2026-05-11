import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { Loader2, Mic2, Sparkles, Headphones, ArrowRight, ArrowLeft, Check, Upload, Puzzle } from "lucide-react";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";

const STEPS = ["role", "handle", "media", "bio", "integrations", "done"] as const;
type Step = typeof STEPS[number];

const SLUG_RE = /^[a-z0-9_]{3,30}$/;

async function uploadAvatar(file: File, userId: string, kind: "avatar" | "cover"): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

export default function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();

  const [step, setStep] = useState<Step>("role");
  const [saving, setSaving] = useState(false);

  const [profileKind, setProfileKind] = useState<"podcaster" | "studio" | "listener">("podcaster");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("");
  const [website, setWebsite] = useState("");
  const [checkingHandle, setCheckingHandle] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth", { replace: true }); return; }
    // pre-fill from existing profile
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) {
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || "");
        setCoverUrl((data as any).cover_url || "");
        setBio((data as any).bio || "");
        setCategory((data as any).category || "");
        setWebsite(data.website || "");
        setUsername((data as any).username || "");
        setProfileKind(((data as any).profile_kind as any) || "podcaster");
        if ((data as any).is_setup_complete) {
          navigate("/dashboard/overview", { replace: true });
        }
      }
    })();
  }, [user, loading, navigate]);

  // Live username availability check
  useEffect(() => {
    if (!username || !SLUG_RE.test(username)) { setHandleAvailable(null); return; }
    let cancelled = false;
    setCheckingHandle(true);
    const t = setTimeout(async () => {
      const { data } = await supabase.from("profiles").select("id").eq("username", username).maybeSingle();
      if (cancelled) return;
      setHandleAvailable(!data || data.id === user?.id);
      setCheckingHandle(false);
    }, 350);
    return () => { cancelled = true; clearTimeout(t); };
  }, [username, user?.id]);

  const stepIndex = STEPS.indexOf(step);
  const next = () => setStep(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)]);
  const back = () => setStep(STEPS[Math.max(stepIndex - 1, 0)]);

  const handleFile = async (file: File, kind: "avatar" | "cover") => {
    if (!user) return;
    try {
      setSaving(true);
      const url = await uploadAvatar(file, user.id, kind);
      if (kind === "avatar") setAvatarUrl(url); else setCoverUrl(url);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  const saveAll = async (markComplete: boolean) => {
    if (!user) return;
    setSaving(true);
    try {
      const payload: any = {
        id: user.id,
        full_name: fullName || null,
        username: username || null,
        bio: bio || null,
        category: category || null,
        avatar_url: avatarUrl || null,
        cover_url: coverUrl || null,
        website: website || null,
        profile_kind: profileKind,
      };
      if (markComplete) payload.is_setup_complete = true;
      const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
      if (error) throw error;
      // assign creator role for non-listeners
      if (profileKind !== "listener") {
        await supabase.from("user_roles").insert({ user_id: user.id, role: "creator" as any }).select();
      }
    } catch (e: any) {
      toast.error(e.message || "Save failed");
      throw e;
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 flex items-center px-6 lg:px-12 border-b border-border/40">
        <Logo size="md" />
      </header>

      <div className="flex-1 flex items-start justify-center px-6 py-10 sm:py-16">
        <Card className="w-full max-w-2xl rounded-3xl p-6 sm:p-10 border-border/60 bg-card">
          {/* Progress dots */}
          <div className="flex items-center gap-2 justify-center mb-8">
            {STEPS.slice(0, -1).map((s, i) => (
              <div key={s} className={`h-1.5 rounded-full transition-all ${i <= stepIndex ? "bg-accent w-8" : "bg-secondary w-4"}`} />
            ))}
          </div>

          {step === "role" && (
            <>
              <h1 className="font-display font-bold text-3xl text-center">Welcome to Resona Africa</h1>
              <p className="text-muted-foreground text-center mt-2">Let's set up your profile in 60 seconds. First — who are you?</p>
              <div className="grid sm:grid-cols-3 gap-3 mt-8">
                {([
                  { v: "podcaster", icon: Sparkles, label: "Podcaster", desc: "I host shows" },
                  { v: "studio", icon: Mic2, label: "Studio / Producer", desc: "I run a studio" },
                  { v: "listener", icon: Headphones, label: "Just listening", desc: "I'm here to discover" },
                ] as const).map((opt) => (
                  <button
                    key={opt.v}
                    onClick={() => setProfileKind(opt.v)}
                    className={`rounded-2xl p-5 text-left border-2 transition-all ${profileKind === opt.v ? "border-accent bg-accent/10" : "border-border hover:border-accent/40"}`}
                  >
                    <opt.icon className="w-6 h-6 text-accent mb-3" />
                    <p className="font-semibold">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "handle" && (
            <>
              <h1 className="font-display font-bold text-3xl">Pick your handle</h1>
              <p className="text-muted-foreground mt-2">This becomes your public profile URL: resona.africa/u/<span className="text-foreground font-semibold">{username || "yourhandle"}</span></p>
              <div className="mt-6 space-y-4">
                <div>
                  <Label>Display name</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Jane Doe" className="mt-1.5" />
                </div>
                <div>
                  <Label>Username</Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                    <Input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} placeholder="janedoe" className="pl-8" maxLength={30} />
                  </div>
                  <p className="text-xs mt-1.5 min-h-[1rem]">
                    {!username && <span className="text-muted-foreground">3–30 chars, letters, numbers, underscore.</span>}
                    {username && !SLUG_RE.test(username) && <span className="text-destructive">Use 3–30 chars: letters, numbers, underscore only.</span>}
                    {username && SLUG_RE.test(username) && checkingHandle && <span className="text-muted-foreground">Checking…</span>}
                    {username && SLUG_RE.test(username) && handleAvailable === true && <span className="text-accent">@{username} is available ✓</span>}
                    {username && SLUG_RE.test(username) && handleAvailable === false && <span className="text-destructive">@{username} is taken.</span>}
                  </p>
                </div>
              </div>
            </>
          )}

          {step === "media" && (
            <>
              <h1 className="font-display font-bold text-3xl">Add a profile photo & cover</h1>
              <p className="text-muted-foreground mt-2">Make your profile pop. You can change these anytime.</p>

              <div className="mt-8 space-y-6">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Profile photo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary border-2 border-border">
                      {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-display text-accent">{(fullName || username || "?")[0]?.toUpperCase()}</div>}
                    </div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary hover:bg-secondary/70 cursor-pointer text-sm font-semibold">
                      <Upload className="w-4 h-4" /> Upload photo
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], "avatar")} />
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Cover banner</Label>
                  <div className="mt-2">
                    <div className="aspect-[4/1] rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-primary to-accent/40 border border-border">
                      {coverUrl && <img src={coverUrl} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <label className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-secondary hover:bg-secondary/70 cursor-pointer text-sm font-semibold">
                      <Upload className="w-4 h-4" /> Upload cover
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], "cover")} />
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === "bio" && (
            <>
              <h1 className="font-display font-bold text-3xl">Tell people about you</h1>
              <p className="text-muted-foreground mt-2">A short bio and category help listeners find you.</p>

              <div className="mt-6 space-y-4">
                <div>
                  <Label>Bio</Label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 280))} placeholder="What do you talk about?" rows={4} className="mt-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">{bio.length}/280</p>
                </div>
                <div>
                  <Label>Category</Label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Choose a category…</option>
                    {categories.map((c: any) => <option key={c.slug} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Website (optional)</Label>
                  <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" className="mt-1.5" />
                </div>
              </div>
            </>
          )}

          {step === "integrations" && (
            <>
              <h1 className="font-display font-bold text-3xl">Connect your platforms</h1>
              <p className="text-muted-foreground mt-2">Already on YouTube or Spotify? Link them so episodes flow into Resona automatically. You can do this later from your dashboard.</p>
              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                <Card className="p-5 rounded-2xl border-border/60">
                  <Puzzle className="w-6 h-6 text-accent mb-2" />
                  <p className="font-semibold">YouTube, Spotify, Apple, SoundCloud</p>
                  <p className="text-xs text-muted-foreground mt-1">Paste a link or import your channel from the Integrations page.</p>
                </Card>
                <Card className="p-5 rounded-2xl border-dashed border-border/60">
                  <p className="text-sm text-muted-foreground">Skip for now — finish your profile first, then we'll show you the wizard.</p>
                </Card>
              </div>
            </>
          )}

          {step === "done" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-accent" />
              </div>
              <h1 className="font-display font-bold text-3xl">You're all set!</h1>
              <p className="text-muted-foreground mt-2">Your profile is live at <span className="text-foreground">resona.africa/u/{username}</span></p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center mt-8">
                <Button onClick={() => navigate(`/u/${username}`)} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">View my profile</Button>
                <Button onClick={() => navigate("/dashboard/overview")} variant="outline" className="rounded-full">Go to dashboard</Button>
              </div>
            </div>
          )}

          {/* Footer nav */}
          {step !== "done" && (
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border/40">
              <Button variant="ghost" onClick={back} disabled={stepIndex === 0 || saving} className="rounded-full">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <div className="flex gap-2">
                {step === "integrations" && (
                  <Button
                    variant="ghost"
                    onClick={async () => { try { await saveAll(true); next(); } catch {} }}
                    disabled={saving}
                    className="rounded-full"
                  >
                    Skip for now
                  </Button>
                )}
                <Button
                  onClick={async () => {
                    if (step === "handle") {
                      if (!SLUG_RE.test(username) || handleAvailable === false) { toast.error("Pick a valid, available username"); return; }
                    }
                    if (step === "integrations") {
                      try { await saveAll(true); } catch { return; }
                      navigate("/dashboard/integrations");
                      return;
                    }
                    if (step === "bio") {
                      try { await saveAll(false); } catch { return; }
                    }
                    next();
                  }}
                  disabled={saving || (step === "handle" && (!SLUG_RE.test(username) || handleAvailable !== true))}
                  className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                  {step === "integrations" ? "Connect platforms" : "Continue"}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
