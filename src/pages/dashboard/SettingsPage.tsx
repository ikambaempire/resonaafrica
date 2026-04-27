import { ComingSoon } from "@/components/ComingSoon";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      description="Profile, channel branding, notifications, and account preferences."
      icon={<Settings className="w-7 h-7 text-primary" />}
    />
  );
}
