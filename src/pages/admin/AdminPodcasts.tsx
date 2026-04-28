import { Mic2 } from "lucide-react";
import { AdminPlaceholder } from "./AdminPlaceholder";

export default function AdminPodcasts() {
  return (
    <AdminPlaceholder
      title="Podcasts"
      subtitle="Review every podcast on Resona Africa, monitor publishing health, and moderate flagged content."
      icon={Mic2}
      metrics={[
        { label: "Total shows", value: "184" },
        { label: "Episodes / month", value: "612" },
        { label: "Pending review", value: "7" },
        { label: "Flagged", value: "2" },
      ]}
    />
  );
}
