import { ComingSoon } from "@/components/ComingSoon";
import { Sparkles } from "lucide-react";

export default function AIClips() {
  return (
    <ComingSoon
      title="AI Clips"
      description="Turn long episodes into short, captioned, social-ready clips."
      icon={<Sparkles className="w-7 h-7 text-primary" />}
    />
  );
}
