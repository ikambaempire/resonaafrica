import { ComingSoon } from "@/components/ComingSoon";
import { Puzzle } from "lucide-react";

export default function Integrations() {
  return (
    <ComingSoon
      title="Integrations"
      description="Connect YouTube, Spotify, and Apple Podcasts to sync analytics and distribution."
      icon={<Puzzle className="w-7 h-7 text-primary" />}
    />
  );
}
