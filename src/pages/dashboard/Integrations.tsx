import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Puzzle, Youtube, Music, Mic, Apple } from "lucide-react";

const platforms = [
  { name: "YouTube", icon: Youtube, status: "Coming soon", desc: "Sync video episodes and analytics from your YouTube channel." },
  { name: "Spotify", icon: Music, status: "Coming soon", desc: "Distribute audio episodes to Spotify and pull listening stats." },
  { name: "Apple Podcasts", icon: Apple, status: "Coming soon", desc: "Submit to Apple Podcasts and track downloads." },
  { name: "SoundCloud", icon: Mic, status: "Coming soon", desc: "Mirror episodes to SoundCloud automatically." },
];

export default function Integrations() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="font-display font-bold text-3xl lg:text-4xl flex items-center gap-3"><Puzzle className="w-8 h-8 text-accent" /> Integrations</h1>
        <p className="mt-1 text-muted-foreground">Connect external platforms to distribute and measure your podcasts.</p>
      </header>
      <p className="text-sm text-muted-foreground">In the meantime, you can still embed YouTube and Spotify episodes when creating an episode in Content.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {platforms.map((p) => (
          <Card key={p.name} className="p-6 rounded-2xl">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><p.icon className="w-5 h-5 text-accent" /></div>
              <span className="text-xs text-muted-foreground">{p.status}</span>
            </div>
            <h3 className="font-display font-bold text-lg">{p.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">{p.desc}</p>
            <Button variant="outline" disabled className="w-full">Connect</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
