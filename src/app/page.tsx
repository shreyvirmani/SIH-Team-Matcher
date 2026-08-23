import Link from "next/link";
import Button from "@/components/ui/button";
import TiltCard from "@/components/ui/tilt-card";
import SIHLogo from "@/components/common/SIHLogo";
import HackmindBadge from "@/components/common/HackmindBadge";
import Hero3DCanvas from "@/components/home/Hero3DCanvas";
import Hero3DMatchCard from "@/components/home/Hero3DMatchCard";
import Home3DStats from "@/components/home/Home3DStats";
import Category3DShowcase from "@/components/home/Category3DShowcase";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/common/ScrollReveal";
import { BrainIcon, DocumentIcon, UsersIcon, ChatIcon } from "@/components/common/Icons";

const FEATURES = [
  {
    icon: BrainIcon,
    title: "AI-Powered Compatibility Scoring",
    desc: "Get an objective 0-100 compatibility score for every teammate with plain-English rationales analyzing complementary tech stacks, availability, and focus.",
    tag: "Compatibility AI",
  },
  {
    icon: DocumentIcon,
    title: "All 226 SIH 2026 Problem Statements",
    desc: "Search and filter through the complete official catalog across all 14 Central Ministries, ISRO, DRDO, and AICTE domains to find teammates with shared goals.",
    tag: "Full Catalog",
  },
  {
    icon: UsersIcon,
    title: "Smart 6-Member Squad Balancer",
    desc: "Send and accept team requests in real time. The platform automatically tracks your team composition and highlights missing developer or design roles.",
    tag: "Squad Optimizer",
  },
  {
    icon: ChatIcon,
    title: "Realtime Squad Chat & Instant Alerts",
    desc: "Coordinate project roadmaps directly in dedicated team chat channels with instant notifications the moment a teammate responds.",
    tag: "Collaboration",
  },
];

const STEPS = [
  { step: "01", title: "Build Your Hacker Profile", desc: "List your tech stack, preferred roles, experience, and contact details." },
  { step: "02", title: "Select SIH 2026 Problem Statements", desc: "Choose from all 226 official challenges across AICTE & Ministries." },
  { step: "03", title: "Discover AI-Ranked Teammates", desc: "Filter by skills, college, and review detailed match compatibility scores." },
  { step: "04", title: "Send Instant Squad Requests", desc: "Connect with developers, designers, and domain experts in one click." },
  { step: "05", title: "Form & Balance Your Squad", desc: "Accept invitations to unlock teammate WhatsApp contacts automatically." },
  { step: "06", title: "Collaborate & Win SIH", desc: "Brainstorm in team chat and build your winning prototype." },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Subtle Geometric Background Canvas */}
      <Hero3DCanvas />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-10 pb-16 sm:pt-16 sm:pb-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Typography & CTA */}
          <div className="text-center lg:text-left lg:col-span-6 xl:col-span-7">
            {/* Badges */}
            <ScrollReveal variant="fade-down" delay={0.05}>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-3.5 py-1.5 backdrop-blur-md">
                  <div className="relative h-4.5 w-4.5 shrink-0 rounded-full bg-white p-0.5 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/sih-bulb-logo.png"
                      alt="SIH Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    Smart India Hackathon Matcher
                  </span>
                </div>

                <HackmindBadge variant="hero" />
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={0.1}>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
                Assemble Your Winning{" "}
                <span className="text-indigo-400">
                  SIH 2026 Squad
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={0.15}>
              <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Stop hunting through unstructured chat groups. Build your hacker profile, choose from all <strong className="text-white font-semibold">226 official SIH problem statements</strong>, get AI-powered compatibility scores with plain-English rationales, and form a balanced 6-member squad in minutes.
              </p>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={0.2}>
              <div className="mt-7 flex flex-col sm:flex-row justify-center lg:justify-start gap-3">
                <Link href="/signup">
                  <Button className="w-full sm:w-auto px-6 py-3 text-sm">
                    Get started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="w-full sm:w-auto px-6 py-3 text-sm">
                    I already have an account
                  </Button>
                </Link>
              </div>
            </ScrollReveal>

            {/* Platform Highlights */}
            <ScrollReveal variant="fade-up" delay={0.25}>
              <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>226 Problem Statements</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <span>AI Compatibility Scoring</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span>Verified Private Contacts</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Hero Match Card */}
          <ScrollReveal variant="scale-up" delay={0.15} className="lg:col-span-6 xl:col-span-5 flex justify-center">
            <Hero3DMatchCard />
          </ScrollReveal>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="relative mx-auto max-w-7xl px-4 py-6">
        <Home3DStats />
      </section>

      {/* 226 Problem Statements Showcase */}
      <section className="relative mx-auto max-w-7xl px-4 py-16">
        <Category3DShowcase />
      </section>

      {/* Feature Cards */}
      <section className="relative border-t border-slate-800/80 bg-slate-900/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollReveal variant="fade-up" className="text-center">
            <span className="rounded-full border border-slate-700 bg-slate-800/60 px-3.5 py-1 text-xs font-semibold text-slate-300">
              Platform Features
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Engineered For SIH Hackers & Squads
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
              Everything needed to discover teammates, balance squad roles, and collaborate effectively.
            </p>
          </ScrollReveal>

          <StaggerContainer staggerDelay={0.06} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <StaggerItem key={f.title} variant="fade-up">
                  <TiltCard
                    maxTilt={6}
                    glow={false}
                    className="p-5 text-left border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all h-full"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-800/50 text-indigo-400">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 rounded border border-slate-800 bg-slate-800/40 px-2 py-0.5">
                        {f.tag}
                      </span>
                    </div>
                    <h3 className="mt-3.5 text-sm font-bold text-white leading-snug">{f.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">{f.desc}</p>
                  </TiltCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* How it works Stepper */}
      <section className="relative py-16">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollReveal variant="fade-up" className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">How It Works</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
              From signing up to a balanced, competition-ready squad in 6 simple steps.
            </p>
          </ScrollReveal>

          <StaggerContainer staggerDelay={0.05} className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s) => (
              <StaggerItem key={s.step} variant="fade-up">
                <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-4 h-full">
                  <div className="flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-xs font-bold text-indigo-400 border border-indigo-500/20">
                      {s.step}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">STEP {s.step}</span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-bold text-slate-200">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA & Credits Footer */}
      <section className="relative border-t border-slate-800/80 py-14 text-center bg-slate-950/80">
        <ScrollReveal variant="fade-up" className="mx-auto max-w-3xl px-4 flex flex-col items-center">
          <SIHLogo size="lg" showText={true} className="mb-5 justify-center" />
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to Build Your Winning Team?
          </h2>
          <p className="mt-2 text-slate-400 text-sm max-w-lg leading-relaxed">
            Create your account now and start connecting with developers, AI engineers, and UI/UX designers across India.
          </p>
          <div className="mt-6 mb-10">
            <Link href="/signup">
              <Button className="px-8 py-3 text-sm">
                Create Your Profile
              </Button>
            </Link>
          </div>

          {/* Hackmind AI credits */}
          <div className="w-full max-w-2xl">
            <HackmindBadge variant="footer" />
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
