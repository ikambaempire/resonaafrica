import { ComingSoon } from "@/components/ComingSoon";
import { Mic2 } from "lucide-react";

export default function Content() {
  return (
    <ComingSoon
      title="Content"
      description="Upload, manage, edit, and schedule your podcast episodes."
      icon={<Mic2 className="w-7 h-7 text-primary" />}
    />
  );
}
