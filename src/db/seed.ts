import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const SKILLS = [
  "React", "Next.js", "Node.js", "Python", "Django", "Flask", "TypeScript",
  "JavaScript", "Java", "Spring Boot", "C++", "Machine Learning", "Deep Learning",
  "TensorFlow", "PyTorch", "Data Analysis", "SQL", "PostgreSQL", "MongoDB",
  "Firebase", "Supabase", "AWS", "Docker", "Kubernetes", "Figma", "UI/UX Design",
  "Flutter", "React Native", "Android (Kotlin)", "iOS (Swift)", "Solidity",
  "Blockchain", "Computer Vision", "NLP", "Cybersecurity", "DevOps", "GraphQL",
  "Tailwind CSS", "Redux", "Express.js", "Go", "Rust",
];

const ROLES = [
  "Frontend Developer", "Backend Developer", "Full-stack Developer",
  "UI/UX Designer", "ML Engineer", "Data Scientist", "DevOps Engineer",
  "Mobile Developer", "Project Manager", "QA Engineer", "Blockchain Developer",
  "Cloud Engineer",
];

const PROBLEM_STATEMENTS: { title: string; description: string; category: string }[] = [
  { title: "Smart Traffic Management System", description: "AI-based system to reduce urban congestion using real-time traffic data.", category: "Smart Automation" },
  { title: "AI-Powered Crop Disease Detection", description: "Mobile app to detect crop diseases from leaf images and suggest remedies.", category: "Agriculture" },
  { title: "Blockchain-based Land Registry", description: "Tamper-proof land record management using blockchain.", category: "Blockchain & Cybersecurity" },
  { title: "Mental Health Support Chatbot", description: "AI chatbot providing first-line mental health support for students.", category: "MedTech" },
  { title: "Waste Segregation & Recycling Tracker", description: "IoT + app solution to track and incentivize household waste segregation.", category: "Clean & Green Technology" },
  { title: "Disaster Response Coordination Platform", description: "Real-time platform connecting volunteers, NGOs, and victims during disasters.", category: "Disaster Management" },
  { title: "Skill-based Micro-learning Platform", description: "Bite-sized, gamified learning platform for vocational skills.", category: "Smart Education" },
  { title: "Accessible Navigation for Visually Impaired", description: "App using computer vision to help visually impaired users navigate indoors.", category: "MedTech" },
  { title: "Fake News Detection Engine", description: "NLP-based system to flag misinformation across social media and news.", category: "Miscellaneous" },
  { title: "Farmer-to-Consumer Direct Marketplace", description: "Platform cutting out middlemen between farmers and consumers.", category: "Agriculture" },
];

function main() {
  const db = getDb();

  const insertSkill = db.prepare("INSERT OR IGNORE INTO skills (name) VALUES (?)");
  for (const s of SKILLS) insertSkill.run(s);

  const insertRole = db.prepare("INSERT OR IGNORE INTO roles (name) VALUES (?)");
  for (const r of ROLES) insertRole.run(r);

  const insertPS = db.prepare(
    "INSERT OR IGNORE INTO problem_statements (title, description, category, is_active) VALUES (?, ?, ?, 1)"
  );
  for (const p of PROBLEM_STATEMENTS) insertPS.run(p.title, p.description, p.category);

  // Seed an admin account for the Admin Dashboard (change password after first login).
  const existingAdmin = db.prepare("SELECT id FROM users WHERE email = ?").get("admin@sihmatcher.dev");
  if (!existingAdmin) {
    const id = randomUUID();
    const hash = bcrypt.hashSync("Admin@123", 10);
    db.prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)").run(
      id,
      "admin@sihmatcher.dev",
      hash
    );
    db.prepare(
      `INSERT INTO profiles (id, full_name, college, branch, year, experience, availability, bio, is_looking_for_team, is_admin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1)`
    ).run(id, "Platform Admin", "N/A", "N/A", 0, "Advanced", "Flexible", "Platform administrator account.");
    console.log("Seeded admin account: admin@sihmatcher.dev / Admin@123");
  }

  console.log(`Seeded ${SKILLS.length} skills, ${ROLES.length} roles, ${PROBLEM_STATEMENTS.length} problem statements.`);
}

main();
