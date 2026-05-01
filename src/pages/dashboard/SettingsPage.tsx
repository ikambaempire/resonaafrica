import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2, Save } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const [fullName, setFullName] = useState("");
  const [companySlug, setCompanySlug] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setCompanySlug(profile.company_slug || "");
      setWebsite(profile.website || "");
      setBio(profile.company_description || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const onUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const path = `${user.id}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: false });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await update.mutateAsync({
        full_name: fullName,
        company_slug: companySlug || null,
        website: website || null,
        company_description: bio || null,
        avatar_url: avatarUrl || null,
      });
      toast.success("Settings saved");
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="font-display font-bold text-3xl lg:text-4xl">Settings</h1>
        <p className="mt-1 text-muted-foreground">Profile, channel branding, and account preferences.</p>
      </header>

      <Card className="p-6 rounded-2xl space-y-5">
        <h2 className="font-display font-bold text-xl">Profile</h2>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full gradient-gold flex items-center justify-center text-primary font-display font-bold text-2xl">
              {(fullName || user?.email || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:bg-secondary cursor-pointer text-sm">
            <Upload className="w-4 h-4" /> {uploading ? "Uploading…" : "Change photo"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} disabled={uploading} />
          </label>
        </div>
        <div>
          <Label>Full name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={user?.email || ""} disabled />
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
        </div>
      </Card>

      <Card className="p-6 rounded-2xl space-y-5">
        <h2 className="font-display font-bold text-xl">Channel branding</h2>
        <div>
          <Label>Channel slug</Label>
          <Input value={companySlug} onChange={(e) => setCompanySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} />
          <p className="text-xs text-muted-foreground mt-1">Your creator profile lives at /c/{companySlug || "your-slug"}</p>
        </div>
        <div>
          <Label>Website</Label>
          <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}
