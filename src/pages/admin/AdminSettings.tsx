import { Settings } from "lucide-react";
import { AdminPlaceholder } from "./AdminPlaceholder";

export default function AdminSettings() {
  return (
    <AdminPlaceholder
      title="Settings"
      subtitle="Platform-wide configuration: branding, integrations, moderation thresholds, and billing."
      icon={Settings}
      metrics={[
        { label: "Integrations", value: "5" },
        { label: "Open feature flags", value: "12" },
        { label: "Auto-moderation", value: "ON" },
        { label: "Webhook health", value: "100%" },
      ]}
    />
  );
}
