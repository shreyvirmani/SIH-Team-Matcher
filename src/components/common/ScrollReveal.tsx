"use client";

import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  variant?: "fade-up" | "fade-down" | "fade-in" | "slide-left" | "slide-right" | "scale-up" | "3d-rise";
  delay?: number;
  duration?: number;
  className?: string;
}

export default function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.6,
  className = "",
}: ScrollRevealProps) {
  const getVariants = (): Variants => {
    switch (variant) {
      case "fade-down":
        return {
          hidden: { opacity: 0, y: -40 },
          visible: { opacity: 1, y: 0 },
        };
      case "slide-left":
        return {
          hidden: { opacity: 0, x: -50 },
          visible: { opacity: 1, x: 0 },
        };
      case "slide-right":
        return {
          hidden: { opacity: 0, x: 50 },
          visible: { opacity: 1, x: 0 },
        };
      case "scale-up":
        return {
          hidden: { opacity: 0, scale: 0.88, y: 30 },
          visible: { opacity: 1, scale: 1, y: 0 },
        };
      case "3d-rise":
        return {
          hidden: { opacity: 0, rotateX: 25, y: 60, scale: 0.95 },
          visible: { opacity: 1, rotateX: 0, y: 0, scale: 1 },
        };
      case "fade-in":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
      case "fade-up":
      default:
        return {
          hidden: { opacity: 0, y: 40 },
          visible: { opacity: 1, y: 0 },
        };
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      variants={getVariants()}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className = "",
}: {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
  variant = "fade-up",
}: {
  children: ReactNode;
  className?: string;
  variant?: "fade-up" | "scale-up" | "3d-rise";
}) {
  const getVariants = (): Variants => {
    switch (variant) {
      case "scale-up":
        return {
          hidden: { opacity: 0, scale: 0.88, y: 30 },
          visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
        };
      case "3d-rise":
        return {
          hidden: { opacity: 0, rotateX: 20, y: 45, scale: 0.92 },
          visible: { opacity: 1, rotateX: 0, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
        };
      case "fade-up":
      default:
        return {
          hidden: { opacity: 0, y: 35 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
        };
    }
  };

  return (
    <motion.div variants={getVariants()} className={className}>
      {children}
    </motion.div>
  );
}

