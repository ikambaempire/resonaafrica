import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Building2, MapPin, Users, Check } from "lucide-react";
import { useStudioBySlug } from "@/hooks/useStudios";
import { useAuth } from "@/contexts/AuthContext";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const fmtMoney = (cents: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);

export default function StudioDetail() {
  const { slug } = useParams();
  const { data: studio, isLoading } = useStudioBySlug(slug);
  const { user } = useAuth();
  const { openCheckout, loading: ckLoading } = usePaddleCheckout();

  const [date, setDate] = useState("");
  const [start, setStart] = useState("10:00");
  const [hours, setHours] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [notes, setNotes] = useState("");

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  if (!studio) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Studio not found.</div>;

  const totalCents = studio.hourly_rate_cents * hours;

  const book = async () => {
    if (!date || !name || !email) { toast.error("Fill in date, name and email"); return; }
    const startAt = new Date(`${date}T${start}:00`);
    const endAt = new Date(startAt.getTime() + hours * 3600 * 1000);

    // Pre-create the booking row (status pending_payment) so the webhook can update it
    const { data: booking, error } = await supabase.from("studio_bookings" as any).insert({
      studio_id: studio.id,
      owner_id: studio.owner_id,
      booker_user_id: user?.id ?? null,
      booker_email: email,
      booker_name: name,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      hours,
      total_cents: totalCents,
      currency: studio.currency,
      notes: notes || null,
      status: "pending_payment",
    } as any).select().single();
    if (error) { toast.error(error.message); return; }

    const dollars = Math.round(totalCents / 100);
    await openCheckout({
      priceId: "studio_booking_unit",
      quantity: dollars,
      customerEmail: email,
      customData: {
        kind: "studio_booking",
        bookingId: (booking as any).id,
        studioId: studio.id,
        ownerId: studio.owner_id,
        userId: user?.id,
      },
      successUrl: `${window.location.origin}/studios/${studio.slug}?booked=1`,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />
      <main className="flex-1 px-6 py-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_400px] gap-8">
          <div>
            <Link to="/studios" className="text-sm text-accent">← All studios</Link>
            <div className="mt-3 aspect-[16/9] rounded-3xl overflow-hidden bg-secondary">
              {studio.cover_url || studio.photos[0] ? (
                <img src={studio.cover_url || studio.photos[0]} alt={studio.name} className="w-full h-full object-cover" />
              ) : <div className="w-full h-full gradient-gold flex items-center justify-center"><Building2 className="w-16 h-16 text-primary" /></div>}
            </div>
            <h1 className="font-display font-bold text-4xl mt-6">{studio.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4" /> {[studio.city, studio.country].filter(Boolean).join(", ") || "Location TBA"}
              <span className="mx-2">·</span> <Users className="w-4 h-4" /> Up to {studio.capacity}
            </p>
            {studio.description && <p className="mt-5 leading-relaxed whitespace-pre-wrap">{studio.description}</p>}
            {studio.amenities.length > 0 && (
              <div className="mt-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {studio.amenities.map((a) => (
                    <span key={a} className="px-3 py-1 rounded-full bg-secondary text-sm flex items-center gap-1.5"><Check className="w-3 h-3 text-accent" /> {a}</span>
                  ))}
                </div>
              </div>
            )}
            {studio.photos.length > 1 && (
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {studio.photos.slice(1).map((p, i) => (
                  <img key={i} src={p} alt="" loading="lazy" className="aspect-square w-full object-cover rounded-xl" />
                ))}
              </div>
            )}
          </div>

          <Card className="rounded-3xl p-6 border-border/60 sticky top-20 self-start">
            <p className="font-display font-bold text-2xl">{fmtMoney(studio.hourly_rate_cents, studio.currency)}<span className="text-sm font-normal text-muted-foreground"> / hour</span></p>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">Start</Label><Input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1" /></div>
              </div>
              <div>
                <Label className="text-xs">Hours</Label>
                <Input type="number" min={1} max={24} value={hours} onChange={(e) => setHours(Math.max(1, parseInt(e.target.value || "1", 10)))} className="mt-1" />
              </div>
              <div><Label className="text-xs">Your name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" /></div>
              <div><Label className="text-xs">Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" /></div>
              <div><Label className="text-xs">Notes (optional)</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1" /></div>
              <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-display font-bold text-xl text-accent">{fmtMoney(totalCents, studio.currency)}</span>
              </div>
              <Button onClick={book} disabled={ckLoading} className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                {ckLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Book & pay
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">Secured by Paddle. You won't be charged until you confirm.</p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
