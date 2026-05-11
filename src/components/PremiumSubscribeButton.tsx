import { useState } from "react";
import { Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function PremiumSubscribeButton({ podcastId }: { podcastId: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openCheckout, loading } = usePaddleCheckout();
  const { isActive } = usePremiumAccess(podcastId);
  const [open, setOpen] = useState(false);

  const subscribe = async (priceId: "premium_monthly" | "premium_yearly") => {
    if (!user) { navigate("/auth"); return; }
    try {
      await openCheckout({
        priceId,
        customerEmail: user.email,
        customData: { kind: "premium", podcastId, userId: user.id },
      });
      setOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (isActive) {
    return (
      <Button variant="outline" disabled className="rounded-full">
        <Check className="w-4 h-4 mr-1" /> Premium active
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <Sparkles className="w-4 h-4 mr-1" /> Subscribe to premium
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resona Premium</DialogTitle>
          <DialogDescription>Unlock premium episodes and bonus content from this show.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Button onClick={() => subscribe("premium_monthly")} disabled={loading} className="rounded-xl h-auto py-4 flex flex-col gap-1">
            <span className="font-semibold">$4.99 / month</span>
            <span className="text-xs opacity-80">Cancel anytime, access until period end</span>
          </Button>
          <Button onClick={() => subscribe("premium_yearly")} disabled={loading} variant="outline" className="rounded-xl h-auto py-4 flex flex-col gap-1 border-accent">
            <span className="font-semibold text-accent">$49 / year</span>
            <span className="text-xs opacity-80">Save 18% vs monthly</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
