import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsStudioOwner } from "@/hooks/useIsStudioOwner";
import { Loader2 } from "lucide-react";

export function StudioOwnerRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { data: isOwner, isLoading } = useIsStudioOwner();
  if (loading || isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isOwner) return <Navigate to="/studios/signup" replace />;
  return <>{children}</>;
}
