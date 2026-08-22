import Link from "next/link";
import Button from "@/components/ui/button";

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
    title: "Stay in the Loop",
    desc: "Real-time notifications keep you updated the moment someone responds to a request or joins your team.",
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
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-20 text-center">
        <span className="mb-4 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
          Built for Smart India Hackathon
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Forge Your Winning <span className="text-indigo-600">SIH Team</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Stop hunting through WhatsApp groups. Build a profile, get AI-scored teammate matches with a clear
          rationale, and form a balanced team in minutes.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/signup">
            <Button className="px-6 py-3 text-base">Get started free</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="px-6 py-3 text-base">
              I already have an account
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900">How it works</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-start gap-3 rounded-lg border border-slate-100 p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
