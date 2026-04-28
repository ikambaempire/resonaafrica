import { Megaphone } from "lucide-react";
import { AdminPlaceholder } from "./AdminPlaceholder";

export default function AdminAnnouncements() {
  return (
    <AdminPlaceholder
      title="Announcements"
      subtitle="Broadcast platform updates and product news to creators and organizations."
      icon={Megaphone}
      metrics={[
        { label: "Sent (30d)", value: "8" },
        { label: "Avg. open rate", value: "62%" },
        { label: "Active recipients", value: "1,284" },
        { label: "Scheduled", value: "3" },
      ]}
    />
  );
}
