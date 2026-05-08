import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import slide1 from "@/assets/hero-resona-play.png";
import slide2 from "@/assets/hero-top10.jpg";
import slide3 from "@/assets/hero-voice-clarity.jpg";

const slides = [
  { src: slide1, alt: "Resona Play — The Home of African Podcasts" },
  { src: slide2, alt: "Top 10 Listened African podcasts" },
  { src: slide3, alt: "Voice, Speed & Clarity — Resona gives you choice and control" },
];

export function HeroCarousel() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const go = (n: number) => setI((n + slides.length) % slides.length);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Soft glow */}
      <div className="absolute -inset-10 -z-10 rounded-full bg-accent/25 blur-3xl" aria-hidden />

      {/* Glass card */}
      <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur-xl shadow-2xl">
        <div className="relative aspect-[3/4]">
          <AnimatePresence mode="wait">
            <motion.img
              key={i}
              src={slides[i].src}
              alt={slides[i].alt}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />
          </AnimatePresence>

          {/* Inner glass sheen */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10" aria-hidden />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" aria-hidden />
        </div>

        {/* Controls */}
        <button
          onClick={() => go(i - 1)}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/25 text-white grid place-items-center transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => go(i + 1)}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/25 text-white grid place-items-center transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Show slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-8 bg-accent" : "w-3 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
