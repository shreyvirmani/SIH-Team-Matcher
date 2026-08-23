// Seeds a real Supabase project: skills, roles, SIH problem statements, and
// a demo admin account. Requires NEXT_PUBLIC_SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY (Project Settings → API → service_role) in
// .env.local. Safe to re-run — every insert is upsert/on-conflict-safe.
//
// Run: npm run seed

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createAdminSupabase } from "../lib/supabase/admin";

const SKILLS = [
  "React", "Next.js", "Vue.js", "Angular", "Node.js", "Express.js", "Fastify", "Python",
  "Django", "Flask", "FastAPI", "TypeScript", "JavaScript", "Java", "Spring Boot", "C++",
  "C#", ".NET", "Go", "Rust", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
  "Scikit-learn", "Computer Vision", "OpenCV", "NLP", "Transformers", "Large Language Models (LLMs)",
  "LangChain", "LlamaIndex", "Generative AI", "Data Analysis", "Pandas & NumPy", "SQL",
  "PostgreSQL", "MongoDB", "Redis", "Supabase", "Firebase", "AWS", "Google Cloud (GCP)",
  "Azure", "Docker", "Kubernetes", "DevOps & CI/CD", "Terraform", "GraphQL", "REST APIs",
  "Tailwind CSS", "Redux & Zustand", "Figma", "UI/UX Design", "Flutter", "React Native",
  "Android (Kotlin)", "iOS (Swift)", "Solidity", "Web3 / Blockchain", "Smart Contracts",
  "IoT & Embedded C", "Arduino & Raspberry Pi", "Cybersecurity & Ethical Hacking", "Microservices",
];

const ROLES = [
  "Frontend Developer", "Backend Developer", "Full-stack Developer",
  "UI/UX Designer", "AI/ML Engineer", "Data Scientist", "DevOps / Cloud Engineer",
  "Mobile App Developer", "Blockchain Developer", "IoT & Embedded Engineer",
  "Cybersecurity Specialist", "Project Manager / Lead", "QA & Testing Engineer",
];

const PROBLEM_STATEMENTS: { title: string; description: string; category: string }[] = [
  {
    title: "SIH1601: Smart Traffic Signal Optimization using Edge AI & Computer Vision",
    description: "Real-time dynamic traffic density estimation at intersections using surveillance cameras and edge AI to optimize signal timers and reduce urban congestion.",
    category: "Smart Automation",
  },
  {
    title: "SIH1602: AI-Powered Early Crop Disease Identification & Advisory",
    description: "Mobile application using computer vision on leaf imagery to accurately diagnose crop diseases, suggest organic/chemical remedies, and predict yield impact.",
    category: "Agriculture, FoodTech & Rural Development",
  },
  {
    title: "SIH1603: Blockchain-based Drug Verification & Anti-Counterfeit Supply Chain",
    description: "End-to-end pharmaceutical provenance tracking system from manufacturer to retail pharmacy using QR codes and immutable ledger records.",
    category: "Blockchain & Cybersecurity",
  },
  {
    title: "SIH1604: Student Drop-out Risk Prediction & Personalized Learning Path Recommender",
    description: "Machine learning platform analyzing student attendance, academic scores, and engagement metrics to flag at-risk students and recommend remedial resources.",
    category: "Smart Education",
  },
  {
    title: "SIH1605: Automated Pothole & Road Anomaly Detection using Mobile Sensors & GIS",
    description: "Crowdsourced road maintenance system utilizing smartphone accelerometer, gyroscope, and GPS data to automatically map and prioritize road defects.",
    category: "Smart Vehicles & Transportation",
  },
  {
    title: "SIH1606: Remote Patient Triage & Vital Signs Monitoring for Rural Health Centers",
    description: "Low-bandwidth telemedicine platform integrating non-invasive vital sensors, automated triage scoring, and multilingual patient consultations.",
    category: "MedTech / Healthcare",
  },
  {
    title: "SIH1607: Real-Time Flood Inundation Mapping & Resource Allocation System",
    description: "Disaster management dashboard combining hydrological sensors, satellite SAR data, and flood simulation to coordinate volunteer and relief logistics.",
    category: "Disaster Management",
  },
  {
    title: "SIH1608: Decentralized Verifiable Academic Credential Issuance & Verification",
    description: "Zero-knowledge proof enabled verifiable certificate platform for universities and employers to instantly verify degrees without centralized single points of failure.",
    category: "Blockchain & Cybersecurity",
  },
  {
    title: "SIH1609: Smart Household Waste Segregation & Circular Economy Incentive Tracker",
    description: "Gamified mobile and IoT scale system that identifies waste categories, logs household segregation accuracy, and issues redemption credits for municipal perks.",
    category: "Clean & Green Technology",
  },
  {
    title: "SIH1610: AR-Powered Cultural Heritage & Monument Interactive Exploration",
    description: "Augmented Reality tourist navigation app providing 3D historic reconstructions, spatial audio guides, and multilingual folklore storytelling at heritage sites.",
    category: "Travel & Heritage",
  },
  {
    title: "SIH1611: Autonomous Drone-based Forest Fire Spotting & Smoke Detection",
    description: "Aerial thermal and optical imaging pipeline executing on-drone neural inference to detect early smoke signatures and broadcast GPS coordinates to forest rangers.",
    category: "Robotics & Drones",
  },
  {
    title: "SIH1612: Smart City Water Distribution Leakage Localization & Pressure Monitoring",
    description: "IoT sensor grid analyzing pressure transients and acoustic signatures across municipal pipelines to detect underground leaks and reduce non-revenue water loss.",
    category: "Clean & Green Technology",
  },
  {
    title: "SIH1613: Solar Microgrid Output Forecasting & Dynamic Load Balancing",
    description: "Deep learning time-series model predicting rooftop solar irradiance and battery state of charge to balance local microgrid consumption and peak grid demand.",
    category: "Renewable / Sustainable Energy",
  },
  {
    title: "SIH1614: Smart EV Charging Station Slot Reservation & Grid Congestion Management",
    description: "Dynamic routing and reservation app for electric vehicle drivers that balances charging demand across nearby stations to prevent local transformer overload.",
    category: "Smart Vehicles & Transportation",
  },
  {
    title: "SIH1615: AI-Driven Legal Document Summarization & Multilingual Citizen Rights Bot",
    description: "NLP tool that translates complex judicial judgments and government statutes into simplified, plain-language summaries in 12+ regional Indian languages.",
    category: "Smart Automation",
  },
  {
    title: "SIH1616: Real-time Fake News & Deepfake Audio/Video Verification Engine",
    description: "Multimodal forensic analysis platform that scans viral social media claims, checks metadata inconsistencies, and flags manipulated audio/video clips.",
    category: "Blockchain & Cybersecurity",
  },
  {
    title: "SIH1617: Direct-to-Consumer Market Access for Handloom Artisans with ONDC Integration",
    description: "E-commerce facilitation portal for rural handloom weavers featuring voice-assisted product listing, AI catalog generation, and ONDC protocol integration.",
    category: "Agriculture, FoodTech & Rural Development",
  },
  {
    title: "SIH1618: Assistive Two-Way Sign Language to Speech Translation Device",
    description: "Wearable or camera-based real-time gesture recognition system converting Indian Sign Language (ISL) gestures to spoken audio and speech to animated ISL avatars.",
    category: "MedTech / Healthcare",
  },
  {
    title: "SIH1619: Marine Litter & Coastal Plastic Accumulation Tracking via Satellite Data",
    description: "Remote sensing and drone imagery processing tool that maps marine debris concentration along coastlines and assists coastal clean-up task forces.",
    category: "Clean & Green Technology",
  },
  {
    title: "SIH1620: Automated Zero-Day Vulnerability Scanning & Cloud Security Posture Auditor",
    description: "Automated scanner that assesses misconfigured cloud IAM policies, checks container vulnerabilities, and generates actionable remediation scripts for developers.",
    category: "Blockchain & Cybersecurity",
  },
  {
    title: "SIH1621: Low-Cost Non-Invasive Anemia & Glucose Detection Device",
    description: "Smartphone-connected optical sensor that measures conjunctival pallor and fingertip photoplethysmography (PPG) to screen for hemoglobin and glucose levels.",
    category: "MedTech / Healthcare",
  },
  {
    title: "SIH1622: AI-Powered Adaptive Exam Proctoring & Behavioral Analysis Platform",
    description: "Privacy-preserving online proctoring system that detects gaze deviation, secondary devices, and anomalous audio while running lightweight edge models on student laptops.",
    category: "Smart Education",
  },
  {
    title: "SIH1623: Urban Groundwater Level Monitoring & Rainwater Harvesting Analytics",
    description: "IoT telemetry for residential and commercial borewells calculating recharge rates, water table decline, and recommending optimal rainwater harvesting structures.",
    category: "Clean & Green Technology",
  },
  {
    title: "SIH1624: AI-Enabled Tourist Safety & Geo-Fenced SOS Alert System",
    description: "Wearable & mobile safety companion for travelers in remote areas featuring mesh networking, geo-fenced danger zones, and offline SOS beaconing.",
    category: "Travel & Heritage",
  },
  {
    title: "SIH1625: Landslide Susceptibility Mapping & Early Warning Siren Network",
    description: "Soil moisture and slope displacement sensor network paired with geological rainfall threshold models to broadcast early evacuation alarms in hilly terrains.",
    category: "Disaster Management",
  },
  {
    title: "SIH1626: Micro-Financing & Alternative Credit Scoring for Gig Workers & Street Vendors",
    description: "Alternative credit scoring platform analyzing UPI transaction velocity, utility payments, and delivery ratings to unlock low-interest microloans for unbanked workers.",
    category: "FinTech",
  },
  {
    title: "SIH1627: Satellite-based Hyperlocal Air Quality Index (AQI) & Pollution Tracker",
    description: "Atmospheric data pipeline fusing Sentinel-5P satellite feeds with ground sensors to forecast particulate matter (PM2.5/PM10) distribution at street level.",
    category: "Space Technology",
  },
  {
    title: "SIH1628: Autonomous Campus Delivery Bot with Obstacle Avoidance",
    description: "Compact 4-wheeled rover navigating university campuses using LiDAR, stereo vision, and GPS waypoints for secure last-yard parcel and document delivery.",
    category: "Robotics & Drones",
  },
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
