import Link from "next/link";
import Button from "@/components/ui/button";
import TiltCard from "@/components/ui/tilt-card";

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
  "Select your SIH problem statement",
  "Discover compatible teammates",
  "Send a team request",
  "Get accepted & form your team",
  "Fill any missing roles",
];

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-24 text-center">
        <span className="mb-4 inline-block rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
          Built for Smart India Hackathon
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Forge Your Winning{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
            SIH Team
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          Stop hunting through WhatsApp groups. Build a profile, get AI-scored teammate matches with a clear
          rationale, and form a balanced team in minutes.
        </p>
        <div className="mt-9 flex justify-center gap-3">
          <Link href="/signup">
            <Button className="px-6 py-3 text-base">Get started free</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="px-6 py-3 text-base">
              I already have an account
            </Button>
          </Link>
        </div>

        <div className="perspective-scene mx-auto mt-16 hidden max-w-3xl gap-6 sm:grid sm:grid-cols-3">
          <div className="animate-float-slow rounded-2xl border border-white/10 bg-white/5 p-4 text-left shadow-2xl backdrop-blur">
            <p className="text-xs text-slate-400">Compatibility</p>
            <p className="mt-1 text-3xl font-bold text-indigo-300">92</p>
            <p className="mt-1 text-xs text-slate-500">Shares your problem statement + complementary skills</p>
          </div>
          <div className="animate-float-slower mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-left shadow-2xl backdrop-blur">
            <p className="text-xs text-slate-400">Team status</p>
            <p className="mt-1 text-sm font-semibold text-white">4 / 5 roles filled</p>
            <p className="mt-1 text-xs text-slate-500">Missing: UI/UX Designer</p>
          </div>
          <div className="animate-float-slow rounded-2xl border border-white/10 bg-white/5 p-4 text-left shadow-2xl backdrop-blur">
            <p className="text-xs text-slate-400">Request</p>
            <p className="mt-1 text-sm font-semibold text-emerald-300">Accepted ✓</p>
            <p className="mt-1 text-xs text-slate-500">Bob Verma joined your team</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <TiltCard key={f.title} className="p-5" maxTilt={6}>
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-white">How it works</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-semibold text-white shadow-[0_0_10px_-2px_rgba(99,102,241,0.8)]">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-300">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
