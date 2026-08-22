// Seeds a real Supabase project: skills, roles, SIH problem statements, and
// a demo admin account. Requires NEXT_PUBLIC_SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY (Project Settings → API → service_role) in
// .env.local. Safe to re-run — every insert is upsert/on-conflict-safe.
//
// Run: npm run seed

import "dotenv/config";
import { createAdminSupabase } from "../lib/supabase/admin";

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

const ADMIN_EMAIL = "admin@sihmatcher.dev";
const ADMIN_PASSWORD = "Admin@123"; // change immediately after first login in any real deployment

async function main() {
  const admin = createAdminSupabase();

  console.log("Seeding skills...");
  await admin.from("skills").upsert(
    SKILLS.map((name) => ({ name })),
    { onConflict: "name", ignoreDuplicates: true }
  );

  console.log("Seeding roles...");
  await admin.from("roles").upsert(
    ROLES.map((name) => ({ name })),
    { onConflict: "name", ignoreDuplicates: true }
  );

  console.log("Seeding problem statements...");
  for (const ps of PROBLEM_STATEMENTS) {
    const { data: existing } = await admin.from("problem_statements").select("id").eq("title", ps.title).maybeSingle();
    if (!existing) {
      await admin.from("problem_statements").insert({ ...ps, is_active: true });
    }
  }

  console.log("Ensuring admin account exists...");
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  let adminUser = existingUsers?.users.find((u) => u.email === ADMIN_EMAIL);

  if (!adminUser) {
    const { data, error } = await admin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    adminUser = data.user;
    console.log(`Created admin auth user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }

  if (adminUser) {
    const { data: existingProfile } = await admin.from("profiles").select("id").eq("id", adminUser.id).maybeSingle();
    if (!existingProfile) {
      await admin.from("profiles").insert({
        id: adminUser.id,
        full_name: "Platform Admin",
        college: "N/A",
        branch: "N/A",
        year: 0,
        experience: "Advanced",
        availability: "Flexible",
        bio: "Platform administrator account.",
        is_looking_for_team: false,
        is_admin: true,
      });
      console.log("Created admin profile.");
    }
  }

  console.log(
    `Done. Seeded ${SKILLS.length} skills, ${ROLES.length} roles, ${PROBLEM_STATEMENTS.length} problem statements.`
  );
  console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD} — change this password before going live.`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
