import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Navigate } from "react-router-dom";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { data: isAdmin, isLoading } = useIsAdmin();

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/dashboard/overview" replace />;
  return <>{children}</>;
}
