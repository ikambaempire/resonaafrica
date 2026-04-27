import { ComingSoon } from "@/components/ComingSoon";
import { BarChart3 } from "lucide-react";

export default function Analytics() {
  return (
    <ComingSoon
      title="Analytics"
      description="Unified plays, retention, and growth across YouTube, Spotify, and Amplify."
      icon={<BarChart3 className="w-7 h-7 text-primary" />}
    />
  );
}
