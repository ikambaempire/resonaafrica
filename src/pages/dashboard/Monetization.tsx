import { ComingSoon } from "@/components/ComingSoon";
import { DollarSign } from "lucide-react";

export default function Monetization() {
  return (
    <ComingSoon
      title="Monetization"
      description="Paid subscriptions, premium episodes, tips, and the sponsorship marketplace."
      icon={<DollarSign className="w-7 h-7 text-primary" />}
    />
  );
}
