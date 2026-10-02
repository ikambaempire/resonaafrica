import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  DollarSign,
  Download,
  Instagram,
  Mic2,
  Play,
  Scissors,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const workflows = [
  {
    id: "clips",
    label: "AI Clips",
    icon: Sparkles,
    status: "Finding your strongest moments",
    description: "AI reads the episode, recommends precise moments, and prepares social-ready cuts.",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    status: "Live performance across platforms",
    description: "See plays, listening time, audience growth, and YouTube performance in one view.",
  },
  {
    id: "scheduler",
    label: "Scheduler",
    icon: CalendarDays,
    status: "Your release plan, organized",
    description: "Prepare episodes once and keep every channel on a consistent publishing schedule.",
  },
  {
    id: "monetization",
    label: "Monetization",
    icon: DollarSign,
    status: "Every earning stream together",
    description: "Track tips, premium subscribers, and creator revenue without leaving your dashboard.",
  },
] as const;

type WorkflowId = (typeof workflows)[number]["id"];

const chartBars = [36, 53, 44, 68, 58, 82, 73, 94, 79, 100, 88, 96];

function ClipWorkspace() {
  return (
    <div className="grid min-h-[330px] gap-4 p-4 sm:p-5 lg:grid-cols-[1.45fr_0.75fr]">
      <div className="flex flex-col rounded-xl border border-border/60 bg-background/70 p-3 sm:p-4">
        <div className="relative flex min-h-44 flex-1 items-center justify-center overflow-hidden rounded-lg bg-secondary">
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 text-[10px] text-muted-foreground">
            <span>Building in Lagos · Episode 18</span>
            <span>03:42 / 38:12</span>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-gold">
            <Play className="ml-0.5 h-5 w-5 fill-current text-accent-foreground" />
          </div>
          <div className="absolute inset-x-3 bottom-3">
            <div className="mb-2 flex items-end gap-0.5">
              {Array.from({ length: 46 }).map((_, index) => (
                <motion.span
                  key={index}
                  className={cn("w-full rounded-full", index > 12 && index < 25 ? "bg-accent" : "bg-muted-foreground/35")}
                  animate={{ height: [5 + (index % 4) * 2, 10 + (index % 6) * 2, 5 + (index % 4) * 2] }}
                  transition={{ duration: 1.2 + (index % 5) * 0.1, repeat: Infinity, delay: index * 0.02 }}
                />
              ))}
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-muted">
              <motion.div className="h-full rounded-full bg-accent" animate={{ width: ["28%", "58%"] }} transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }} />
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] sm:text-xs">
          {["9:16 Reels", "1:1 Feed", "16:9 YouTube"].map((ratio, index) => (
            <div key={ratio} className={cn("rounded-md border px-2 py-2 text-center", index === 0 ? "border-accent/60 bg-accent/10 text-accent" : "border-border/60 text-muted-foreground")}>{ratio}</div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">Recommended clips</span>
          <span className="text-[10px] text-accent">4 found</span>
        </div>
        {[
          ["The lesson nobody tells founders", "00:42–01:21", "92"],
          ["Why local context wins", "08:14–09:02", "87"],
          ["A hard truth about growth", "21:08–21:52", "83"],
        ].map(([title, time, score], index) => (
          <motion.div
            key={title}
            className={cn("rounded-lg border p-3", index === 0 ? "border-accent/50 bg-accent/10" : "border-border/60 bg-background/60")}
            animate={index === 0 ? { borderColor: ["hsl(var(--accent) / 0.35)", "hsl(var(--accent) / 0.8)", "hsl(var(--accent) / 0.35)"] } : undefined}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            <div className="flex items-start gap-2">
              <Scissors className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{time} · {Number(score)}% AI score</p>
              </div>
            </div>
          </motion.div>
        ))}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button size="sm" variant="secondary" className="rounded-md text-xs"><Instagram /> Share</Button>
          <Button size="sm" className="rounded-md bg-accent text-accent-foreground hover:bg-accent/90 text-xs"><Download /> Export</Button>
        </div>
      </div>
    </div>
  );
}

function AnalyticsWorkspace() {
  return (
    <div className="min-h-[330px] p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {[
          ["Total plays", "124.8K", "+18.2%"],
          ["Watch time", "6,420h", "+12.5%"],
          ["Subscribers", "8,914", "+342"],
          ["Avg. retention", "68%", "+4.1%"],
        ].map(([label, value, change]) => (
          <div key={label} className="rounded-lg border border-border/60 bg-background/70 p-3">
            <p className="text-[10px] text-muted-foreground sm:text-xs">{label}</p>
            <p className="mt-1 font-display text-lg font-bold text-foreground sm:text-xl">{value}</p>
            <p className="mt-1 flex items-center gap-1 text-[10px] text-success"><TrendingUp className="h-3 w-3" />{change}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[1.5fr_0.7fr]">
        <div className="rounded-lg border border-border/60 bg-background/70 p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-semibold text-foreground">Audience growth</p><p className="text-[10px] text-muted-foreground">Last 30 days</p></div>
            <span className="rounded-md bg-success/10 px-2 py-1 text-[10px] text-success">Live</span>
          </div>
          <div className="mt-5 flex h-32 items-end gap-1.5 sm:gap-2">
            {chartBars.map((height, index) => (
              <motion.div key={index} className="relative flex-1 overflow-hidden rounded-t bg-secondary" initial={{ height: "6%" }} animate={{ height: `${height}%` }} transition={{ duration: 0.5, delay: index * 0.04 }}>
                <div className="absolute inset-0 bg-accent/70" />
              </motion.div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/70 p-4">
          <p className="text-xs font-semibold text-foreground">Top platforms</p>
          <div className="mt-4 space-y-4">
            {[["YouTube", "54%"], ["Spotify", "29%"], ["Apple", "17%"]].map(([name, value], index) => (
              <div key={name}>
                <div className="mb-1 flex justify-between text-[10px]"><span className="text-muted-foreground">{name}</span><span className="text-foreground">{value}</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary"><motion.div className="h-full bg-accent" initial={{ width: 0 }} animate={{ width: value }} transition={{ duration: 0.7, delay: index * 0.12 }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SchedulerWorkspace() {
  const days = ["MON 12", "TUE 13", "WED 14", "THU 15", "FRI 16"];
  return (
    <div className="min-h-[330px] p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div><p className="text-sm font-semibold text-foreground">May release calendar</p><p className="text-[10px] text-muted-foreground">3 episodes ready to publish</p></div>
        <Button size="sm" className="rounded-md bg-accent text-accent-foreground hover:bg-accent/90"><Upload /> Schedule</Button>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-1.5 sm:gap-2">
        {days.map((day, dayIndex) => (
          <div key={day} className="min-h-52 rounded-lg border border-border/60 bg-background/70 p-1.5 sm:p-2">
            <p className="border-b border-border/50 pb-2 text-center text-[8px] font-semibold text-muted-foreground sm:text-[10px]">{day}</p>
            {dayIndex === 1 && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-md border border-accent/40 bg-accent/10 p-1.5 sm:p-2"><Mic2 className="h-3 w-3 text-accent" /><p className="mt-1 hidden text-[9px] font-semibold text-foreground sm:block">Founder Stories</p><p className="mt-1 text-[8px] text-muted-foreground">09:00</p></motion.div>}
            {dayIndex === 3 && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-12 rounded-md border border-success/40 bg-success/10 p-1.5 sm:p-2"><Check className="h-3 w-3 text-success" /><p className="mt-1 hidden text-[9px] font-semibold text-foreground sm:block">Tech in Africa</p><p className="mt-1 text-[8px] text-muted-foreground">14:30</p></motion.div>}
            {dayIndex === 4 && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 rounded-md border border-border bg-secondary/70 p-1.5 sm:p-2"><Clock3 className="h-3 w-3 text-accent" /><p className="mt-1 hidden text-[9px] font-semibold text-foreground sm:block">Weekly Recap</p><p className="mt-1 text-[8px] text-muted-foreground">17:00</p></motion.div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MonetizationWorkspace() {
  return (
    <div className="grid min-h-[330px] gap-3 p-4 sm:p-5 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-lg border border-border/60 bg-background/70 p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div><p className="text-xs text-muted-foreground">Creator earnings · May</p><p className="mt-1 font-display text-3xl font-bold text-foreground">$2,840.50</p></div>
          <span className="rounded-md bg-success/10 px-2 py-1 text-[10px] text-success">+22.4%</span>
        </div>
        <div className="mt-8 flex h-32 items-end gap-2">
          {[32, 47, 43, 64, 58, 78, 73, 92].map((height, index) => (
            <motion.div key={index} className="flex-1 rounded-t bg-accent/75" initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ duration: 0.55, delay: index * 0.06 }} />
          ))}
        </div>
        <div className="mt-3 flex justify-between text-[9px] text-muted-foreground"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span></div>
      </div>
      <div className="space-y-2">
        <p className="mb-3 text-xs font-semibold text-foreground">Revenue streams</p>
        {[
          ["Premium subscribers", "$1,820", Users],
          ["Listener tips", "$640", DollarSign],
          ["Brand sponsorships", "$380", Sparkles],
        ].map(([label, value, Icon], index) => {
          const RevenueIcon = Icon as typeof Users;
          return (
            <motion.div key={label as string} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.12 }} className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/70 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10"><RevenueIcon className="h-4 w-4 text-accent" /></div>
              <div className="min-w-0 flex-1"><p className="truncate text-[10px] text-muted-foreground sm:text-xs">{label as string}</p><p className="text-sm font-bold text-foreground">{value as string}</p></div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          );
        })}
        <div className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-[10px] text-muted-foreground">Next payout <span className="float-right font-semibold text-foreground">May 28</span></div>
      </div>
    </div>
  );
}

function Workspace({ active }: { active: WorkflowId }) {
  if (active === "analytics") return <AnalyticsWorkspace />;
  if (active === "scheduler") return <SchedulerWorkspace />;
  if (active === "monetization") return <MonetizationWorkspace />;
  return <ClipWorkspace />;
}

export function DashboardMotionShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const active = workflows[activeIndex];

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % workflows.length), 6500);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <section className="border-t border-border/40 bg-secondary/20 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent"><Sparkles className="h-3 w-3" /> Watch it work</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-6xl">See your creator dashboard <span className="text-accent">in motion</span></h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg">From one full episode to social clips, live insights, scheduled releases, and earnings—all in one connected workflow.</p>
        </div>

        <div className="mx-auto mt-10 max-w-6xl overflow-hidden rounded-xl border border-border/70 bg-card shadow-soft">
          <div className="flex items-center justify-between border-b border-border/60 px-3 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-50" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" /></span>
              <span className="truncate text-[10px] font-medium text-muted-foreground sm:text-xs">Live product demo</span>
            </div>
            <div className="hidden items-center gap-1 text-[10px] text-muted-foreground sm:flex"><Mic2 className="h-3 w-3 text-accent" /> Resona creator workspace</div>
          </div>

          <div className="grid grid-cols-2 border-b border-border/60 sm:grid-cols-4">
            {workflows.map((workflow, index) => (
              <Button
                key={workflow.id}
                variant="ghost"
                onClick={() => setActiveIndex(index)}
                aria-pressed={index === activeIndex}
                className={cn("relative h-12 rounded-none border-r border-border/50 px-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground sm:h-14 sm:text-sm", index === activeIndex && "bg-accent/10 text-accent hover:bg-accent/10 hover:text-accent")}
              >
                <workflow.icon className="h-4 w-4" />
                {workflow.label}
                {index === activeIndex && <motion.span layoutId="active-workflow" className="absolute inset-x-0 bottom-0 h-0.5 bg-accent" />}
              </Button>
            ))}
          </div>

          <div className="grid lg:grid-cols-[220px_1fr]">
            <aside className="hidden border-r border-border/60 p-4 lg:block">
              <div className="flex items-center gap-2 border-b border-border/50 pb-4"><div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent"><Mic2 className="h-4 w-4 text-accent-foreground" /></div><div><p className="text-xs font-bold text-foreground">My Studio</p><p className="text-[9px] text-muted-foreground">Creator account</p></div></div>
              <div className="mt-4 space-y-1">
                {workflows.map((workflow, index) => <div key={workflow.id} className={cn("flex items-center gap-2 rounded-md px-2.5 py-2 text-[11px]", index === activeIndex ? "bg-accent/10 text-accent" : "text-muted-foreground")}><workflow.icon className="h-3.5 w-3.5" />{workflow.label}</div>)}
              </div>
              <div className="mt-5 rounded-lg bg-secondary/60 p-3"><p className="text-[10px] font-semibold text-foreground">Episode storage</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full w-3/5 bg-accent" /></div><p className="mt-2 text-[9px] text-muted-foreground">12.4 GB of 20 GB</p></div>
            </aside>

            <div className="min-w-0">
              <div className="flex min-h-20 items-center justify-between gap-3 border-b border-border/50 px-4 py-3 sm:px-5">
                <AnimatePresence mode="wait">
                  <motion.div key={active.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.22 }}>
                    <p className="text-sm font-bold text-foreground sm:text-base">{active.status}</p>
                    <p className="mt-1 max-w-xl text-[10px] leading-relaxed text-muted-foreground sm:text-xs">{active.description}</p>
                  </motion.div>
                </AnimatePresence>
                <span className="hidden shrink-0 items-center gap-1 rounded-md border border-border/60 px-2 py-1 text-[9px] text-muted-foreground sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Updated now</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={active.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: reduceMotion ? 0 : 0.32 }}>
                  <Workspace active={active.id} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="h-1 bg-secondary"><motion.div key={`progress-${active.id}`} className="h-full bg-accent" initial={{ width: "0%" }} animate={{ width: reduceMotion ? "100%" : "100%" }} transition={{ duration: reduceMotion ? 0 : 6.5, ease: "linear" }} /></div>
        </div>
      </div>
    </section>
  );
}