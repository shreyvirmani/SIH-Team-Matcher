"use client";

export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`glass-panel rounded-2xl ${className}`}>{children}</div>;
}
