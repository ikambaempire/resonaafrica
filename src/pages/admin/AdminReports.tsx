import { FileText } from "lucide-react";
import { AdminPlaceholder } from "./AdminPlaceholder";

export default function AdminReports() {
  return (
    <AdminPlaceholder
      title="Reports"
      subtitle="Export operational reports — content, revenue, audience, and creator performance."
      icon={FileText}
      metrics={[
        { label: "Reports built", value: "24" },
        { label: "This month", value: "6" },
        { label: "Scheduled exports", value: "4" },
        { label: "Last export", value: "2h ago" },
      ]}
    />
  );
}
