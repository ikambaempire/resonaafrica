import { CreditCard } from "lucide-react";
import { AdminPlaceholder } from "./AdminPlaceholder";

export default function AdminRevenue() {
  return (
    <AdminPlaceholder
      title="Revenue"
      subtitle="Track subscription revenue, sponsorship deals, and creator payouts in one place."
      icon={CreditCard}
      metrics={[
        { label: "MRR", value: "$12,480" },
        { label: "Annual run-rate", value: "$149K" },
        { label: "Pending payouts", value: "$3,210" },
        { label: "Refunds (30d)", value: "$184" },
      ]}
    />
  );
}
