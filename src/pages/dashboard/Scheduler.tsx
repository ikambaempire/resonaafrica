import { ComingSoon } from "@/components/ComingSoon";
import { Calendar } from "lucide-react";

export default function Scheduler() {
  return (
    <ComingSoon
      title="Scheduler"
      description="Plan, schedule, and auto-publish episodes from a calendar view."
      icon={<Calendar className="w-7 h-7 text-primary" />}
    />
  );
}
