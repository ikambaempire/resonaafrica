import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { ComingSoon } from "@/components/ComingSoon";
import { Compass } from "lucide-react";

export default function Discover() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />
      <div className="flex-1 py-16 px-6 lg:px-8">
        <ComingSoon
          title="Discover"
          description="Trending podcasts, featured creators, and curated categories from across Africa."
          icon={<Compass className="w-7 h-7 text-primary" />}
        />
      </div>
      <Footer />
    </div>
  );
}
