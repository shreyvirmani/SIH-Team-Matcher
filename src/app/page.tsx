import Link from "next/link";
import Button from "@/components/ui/button";
import TiltCard from "@/components/ui/tilt-card";
import SIHLogo from "@/components/common/SIHLogo";
import HackmindBadge from "@/components/common/HackmindBadge";

const FEATURES = [
  {
    title: "AI-Powered Compatibility",
    desc: "Get a 0-100 compatibility score for every potential teammate, with a plain-English rationale for why they're a good fit.",
  },
  {
    title: "Smart Discovery",
    desc: "Search and filter by problem statement, role, skills, college, and availability to find exactly who you need.",
  },
  {
    title: "Effortless Team Building",
    desc: "Send, accept, and reject team requests. See your team's composition and instantly spot missing roles or skills.",
  },
  {
    title: "Team Chat & Realtime Alerts",
    desc: "Coordinate with your teammates in a built-in chat, and get notified live the moment someone responds.",
  },
];

const STEPS = [
  "Sign up & build your profile",
  "Select your SIH 2026 problem statement",
  "Discover compatible teammates",
  "Send a team request",
  "Get accepted & form your team",
  "Fill any missing roles",
];

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center">
        {/* Badges: Official SIH Badge & Hackmind AI Badge */}
        <div className="flex flex-col items-center justify-center gap-3 mb-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 shadow-[0_0_20px_-3px_rgba(245,158,11,0.3)]">
              <div className="relative h-6 w-6 shrink-0 rounded-full bg-white p-0.5 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/sih-bulb-logo.png"
                  alt="SIH Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-xs font-semibold text-amber-300">
                Official Hackathon Teammate Matching Platform
              </span>
            </div>

            <HackmindBadge variant="hero" />
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl max-w-4xl mx-auto leading-tight">
          Forge Your Winning{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
            SIH 2026 Team
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          Stop hunting through unorganized chat groups. Build your hacker profile, select real SIH 2026 problem statements, get AI-scored compatibility matches with explanations, and assemble your balanced 6-member squad in minutes.
        </p>
        <div className="mt-9 flex justify-center gap-3">
          <Link href="/signup">
            <Button className="px-6 py-3 text-base">Get started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="px-6 py-3 text-base">
              I already have an account
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <TiltCard key={f.title} className="p-6 text-left" maxTilt={8}>
              <h3 className="text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/10 bg-slate-900/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-white">How It Works</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-400">
            From registration to a balanced, competition-ready team in 6 straightforward steps.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step, idx) => (
              <div
                key={step}
                className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-sm font-bold text-indigo-300">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-slate-200">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA & Credits Footer */}
      <section className="border-t border-white/10 py-16 text-center">
        <div className="mx-auto max-w-3xl px-4 flex flex-col items-center">
          <SIHLogo size="lg" showText={true} className="mb-6 justify-center" />
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to win SIH 2026?</h2>
          <p className="mt-3 text-slate-400 text-sm max-w-lg">
            Create your account now and start connecting with top developers, designers, and innovators across India.
          </p>
          <div className="mt-8 mb-12">
            <Link href="/signup">
              <Button className="px-8 py-3 text-base">Create Your Profile</Button>
            </Link>
          </div>

          {/* Hackmind AI credits box */}
          <div className="w-full max-w-2xl">
            <HackmindBadge variant="footer" />
          </div>
        </div>
      </section>
    </div>
  );
}
