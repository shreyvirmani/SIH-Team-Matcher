"use client";

export default function Avatar({
  url,
  name,
  size = 40,
}: {
  url?: string | null;
  name: string;
  size?: number;
}) {
  const initials = (name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full border border-indigo-400/30 object-cover shadow-[0_0_12px_-4px_rgba(99,102,241,0.7)]"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full border border-indigo-400/30 bg-gradient-to-br from-indigo-500 to-fuchsia-500 font-semibold text-white shadow-[0_0_12px_-4px_rgba(99,102,241,0.7)]"
    >
      <span style={{ fontSize: size * 0.36 }}>{initials}</span>
    </div>
  );
}
