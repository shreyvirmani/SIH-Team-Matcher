import Link from "next/link";
import Button from "@/components/ui/button";
import TiltCard from "@/components/ui/tilt-card";
import SIHLogo from "@/components/common/SIHLogo";
import HackmindBadge from "@/components/common/HackmindBadge";
import Hero3DCanvas from "@/components/home/Hero3DCanvas";
import Hero3DMatchCard from "@/components/home/Hero3DMatchCard";
import Home3DStats from "@/components/home/Home3DStats";
import Category3DShowcase from "@/components/home/Category3DShowcase";

const FEATURES = [
  {
    icon: "🧠",
    title: "AI-Powered Compatibility Scoring",
    desc: "Get an accurate 0-100 compatibility score for every teammate with deep plain-English rationales analyzing complementary tech stacks, availability, and focus.",
    tag: "Multi-factor Scoring",
  },
  {
    icon: "📜",
    title: "All 226 SIH 2026 Problem Statements",
    desc: "Search and filter through the complete official catalog across all 14 Central Ministries, ISRO, DRDO, and AICTE domains to find teammates with shared goals.",
    tag: "Official Catalog",
  },
  {
    icon: "🛡️",
    title: "Smart 6-Member Squad Balancer",
    desc: "Send and accept team requests in real time. The platform automatically tracks your team composition and highlights missing developer or design roles.",
    tag: "Role Optimization",
  },
  {
    icon: "💬",
    title: "Realtime Squad Chat & Live Alerts",
    desc: "Coordinate project roadmaps directly in dedicated team chat channels with instant notifications the moment a teammate responds.",
    tag: "Instant Collaboration",
  },
];

const STEPS = [
  { step: "01", title: "Build Your Hacker Profile", desc: "List your tech stack, preferred roles, experience, and contact info." },
  { step: "02", title: "Select SIH 2026 Problem Statements", desc: "Choose from all 226 official challenges across AICTE & Ministries." },
  { step: "03", title: "Discover AI-Ranked Teammates", desc: "Filter by skills, college, and review detailed match compatibility scores." },
  { step: "04", title: "Send Instant Squad Requests", desc: "Connect with developers, designers, and domain experts in one click." },
  { step: "05", title: "Form & Balance Your Squad", desc: "Accept invitations to unlock teammate WhatsApp contacts automatically." },
  { step: "06", title: "Collaborate & Win SIH", desc: "Brainstorm in team chat and build your winning prototype." },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* 3D Interactive Background Canvas */}
      <Hero3DCanvas />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Hero Typography & CTA */}
          <div className="text-center lg:text-left lg:col-span-6 xl:col-span-7">
            {/* Official Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1.5 shadow-[0_0_20px_-3px_rgba(245,158,11,0.3)] backdrop-blur-md">
                <div className="relative h-5 w-5 shrink-0 rounded-full bg-white p-0.5 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/sih-bulb-logo.png"
                    alt="SIH Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="text-xs font-semibold text-amber-300">
                  Official Smart India Hackathon Matcher
                </span>
              </div>

              <HackmindBadge variant="hero" />
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.12]">
              Assemble Your Winning{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(129,140,248,0.4)]">
                SIH 2026 Squad
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              No more searching through cluttered WhatsApp groups. Build your hacker profile, choose from all <strong className="text-amber-300 font-semibold">226 official SIH problem statements</strong>, get AI-powered compatibility scores with plain-English rationales, and form a balanced 6-member squad in minutes.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-3.5">
              <Link href="/signup">
                <Button className="w-full sm:w-auto px-7 py-3.5 text-base shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] transition-all">
                  Get started
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full sm:w-auto px-7 py-3.5 text-base hover:border-white/30">
                  I already have an account
                </Button>
              </Link>
            </div>

            {/* Quick Live Stats Pill */}
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>226 Problem Statements</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                <span>AI Compatibility Rationale</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>Verified Private Contacts</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Match Card Preview */}
          <div className="lg:col-span-6 xl:col-span-5 flex justify-center">
            <Hero3DMatchCard />
          </div>
        </div>
      </section>

      {/* 3D Interactive Stats Strip */}
      <section className="relative mx-auto max-w-7xl px-4 py-8">
        <Home3DStats />
      </section>

      {/* 226 Problem Statements Showcase */}
      <section className="relative mx-auto max-w-7xl px-4 py-20">
        <Category3DShowcase />
      </section>

      {/* 3D Feature Cards */}
      <section className="relative border-t border-white/10 bg-slate-900/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
              Everything You Need To Win
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Engineered Specifically For SIH Hackers
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
              Smart India Hackathon teams need diverse roles, shared vision, and instant communication.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <TiltCard
                key={f.title}
                maxTilt={10}
                className="p-6 text-left border border-white/10 bg-slate-900/60 shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{f.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5">
                    {f.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-white leading-snug">{f.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{f.desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* How it works 3D Stepper */}
      <section className="relative py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">How It Works</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
              From signing up to a balanced, competition-ready squad in 6 intuitive steps.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s) => (
              <TiltCard
                key={s.step}
                maxTilt={8}
                className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-indigo-500/30"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-xs font-black text-indigo-300 border border-indigo-500/30">
                    {s.step}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">STEP {s.step}</span>
                </div>
                <h3 className="mt-2 text-sm font-bold text-slate-100">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA & Credits Footer */}
      <section className="relative border-t border-white/10 py-16 text-center bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 flex flex-col items-center">
          <SIHLogo size="lg" showText={true} className="mb-6 justify-center" />
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to Build Your Winning Team?
          </h2>
          <p className="mt-3 text-slate-300 text-sm max-w-lg leading-relaxed">
            Create your account now and start connecting with top developers, AI engineers, and UI/UX designers across India.
          </p>
          <div className="mt-8 mb-12">
            <Link href="/signup">
              <Button className="px-9 py-3.5 text-base shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                Create Your Profile
              </Button>
            </Link>
          </div>

          {/* Hackmind AI credits */}
          <div className="w-full max-w-2xl">
            <HackmindBadge variant="footer" />
          </div>
        </div>
      </section>
    </div>
  );
}
