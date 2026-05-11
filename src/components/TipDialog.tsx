import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { toast } from "sonner";

const PRESETS = [1, 5, 10, 25];

export function TipDialog({ podcastId, episodeId, creatorName }: { podcastId: string; episodeId?: string; creatorName?: string }) {
  const { user } = useAuth();
  const { openCheckout, loading } = usePaddleCheckout();
  const [amount, setAmount] = useState<number>(5);
  const [custom, setCustom] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [open, setOpen] = useState(false);

  const finalAmount = custom ? Math.max(1, Math.floor(Number(custom) || 0)) : amount;

  const onTip = async () => {
    if (!finalAmount || finalAmount < 1) { toast.error("Minimum tip is $1"); return; }
    try {
      await openCheckout({
        priceId: "tip_unit",
        quantity: finalAmount,
        customerEmail: user?.email,
        customData: {
          kind: "tip",
          podcastId,
          episodeId,
          userId: user?.id,
          message: message.slice(0, 200),
        },
      });
      setOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold">
          <Heart className="w-4 h-4 mr-1" /> Tip the creator
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send a tip{creatorName ? ` to ${creatorName}` : ""}</DialogTitle>
          <DialogDescription>100% goes to supporting the show (minus a small platform fee).</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <Button
              key={p}
              variant={!custom && amount === p ? "default" : "outline"}
              onClick={() => { setAmount(p); setCustom(""); }}
              className="rounded-xl"
            >
              ${p}
            </Button>
          ))}
        </div>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Custom amount (USD)</label>
          <Input type="number" min={1} placeholder="Enter amount" value={custom} onChange={(e) => setCustom(e.target.value)} />
        </div>
        <Textarea placeholder="Optional message to the creator" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={200} />
        <Button onClick={onTip} disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold">
          {loading ? "Opening checkout…" : `Send $${finalAmount} tip`}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
