import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background gradient-hero px-4">
      <div className="text-center">
        <p className="font-display font-bold text-7xl text-accent">404</p>
        <h1 className="mt-4 font-display font-bold text-3xl text-foreground">Page not found</h1>
        <p className="mt-2 text-muted-foreground">The page you're looking for doesn't exist or has moved.</p>
        <Button asChild className="mt-6 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
