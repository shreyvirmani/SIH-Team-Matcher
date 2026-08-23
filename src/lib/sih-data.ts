export interface ProblemStatementData {
  id?: number;
  title: string;
  description: string;
  category: string;
}

export const SIH_PROBLEM_STATEMENTS: ProblemStatementData[] = [
  {
    id: 1,
    title: "SIH1601: Smart Traffic Signal Optimization using Edge AI & Computer Vision",
    description: "Real-time dynamic traffic density estimation at intersections using surveillance cameras and edge AI to optimize signal timers and reduce urban congestion.",
    category: "Smart Automation",
  },
  {
    id: 2,
    title: "SIH1602: AI-Powered Early Crop Disease Identification & Advisory",
    description: "Mobile application using computer vision on leaf imagery to accurately diagnose crop diseases, suggest organic/chemical remedies, and predict yield impact.",
    category: "Agriculture, FoodTech & Rural Development",
  },
  {
    id: 3,
    title: "SIH1603: Blockchain-based Drug Verification & Anti-Counterfeit Supply Chain",
    description: "End-to-end pharmaceutical provenance tracking system from manufacturer to retail pharmacy using QR codes and immutable ledger records.",
    category: "Blockchain & Cybersecurity",
  },
  {
    id: 4,
    title: "SIH1604: Student Drop-out Risk Prediction & Personalized Learning Path Recommender",
    description: "Machine learning platform analyzing student attendance, academic scores, and engagement metrics to flag at-risk students and recommend remedial resources.",
    category: "Smart Education",
  },
  {
    id: 5,
    title: "SIH1605: Automated Pothole & Road Anomaly Detection using Mobile Sensors & GIS",
    description: "Crowdsourced road maintenance system utilizing smartphone accelerometer, gyroscope, and GPS data to automatically map and prioritize road defects.",
    category: "Smart Vehicles & Transportation",
  },
  {
    id: 6,
    title: "SIH1606: Remote Patient Triage & Vital Signs Monitoring for Rural Health Centers",
    description: "Low-bandwidth telemedicine platform integrating non-invasive vital sensors, automated triage scoring, and multilingual patient consultations.",
    category: "MedTech / Healthcare",
  },
  {
    id: 7,
    title: "SIH1607: Real-Time Flood Inundation Mapping & Resource Allocation System",
    description: "Disaster management dashboard combining hydrological sensors, satellite SAR data, and flood simulation to coordinate volunteer and relief logistics.",
    category: "Disaster Management",
  },
  {
    id: 8,
    title: "SIH1608: Decentralized Verifiable Academic Credential Issuance & Verification",
    description: "Zero-knowledge proof enabled verifiable certificate platform for universities and employers to instantly verify degrees without centralized single points of failure.",
    category: "Blockchain & Cybersecurity",
  },
  {
    id: 9,
    title: "SIH1609: Smart Household Waste Segregation & Circular Economy Incentive Tracker",
    description: "Gamified mobile and IoT scale system that identifies waste categories, logs household segregation accuracy, and issues redemption credits for municipal perks.",
    category: "Clean & Green Technology",
  },
  {
    id: 10,
    title: "SIH1610: AR-Powered Cultural Heritage & Monument Interactive Exploration",
    description: "Augmented Reality tourist navigation app providing 3D historic reconstructions, spatial audio guides, and multilingual folklore storytelling at heritage sites.",
    category: "Travel & Heritage",
  },
  {
    id: 11,
    title: "SIH1611: Autonomous Drone-based Forest Fire Spotting & Smoke Detection",
    description: "Aerial thermal and optical imaging pipeline executing on-drone neural inference to detect early smoke signatures and broadcast GPS coordinates to forest rangers.",
    category: "Robotics & Drones",
  },
  {
    id: 12,
    title: "SIH1612: Smart City Water Distribution Leakage Localization & Pressure Monitoring",
    description: "IoT sensor grid analyzing pressure transients and acoustic signatures across municipal pipelines to detect underground leaks and reduce non-revenue water loss.",
    category: "Clean & Green Technology",
  },
  {
    id: 13,
    title: "SIH1613: Solar Microgrid Output Forecasting & Dynamic Load Balancing",
    description: "Deep learning time-series model predicting rooftop solar irradiance and battery state of charge to balance local microgrid consumption and peak grid demand.",
    category: "Renewable / Sustainable Energy",
  },
  {
    id: 14,
    title: "SIH1614: Smart EV Charging Station Slot Reservation & Grid Congestion Management",
    description: "Dynamic routing and reservation app for electric vehicle drivers that balances charging demand across nearby stations to prevent local transformer overload.",
    category: "Smart Vehicles & Transportation",
  },
  {
    id: 15,
    title: "SIH1615: AI-Driven Legal Document Summarization & Multilingual Citizen Rights Bot",
    description: "NLP tool that translates complex judicial judgments and government statutes into simplified, plain-language summaries in 12+ regional Indian languages.",
    category: "Smart Automation",
  },
  {
    id: 16,
    title: "SIH1616: Real-time Fake News & Deepfake Audio/Video Verification Engine",
    description: "Multimodal forensic analysis platform that scans viral social media claims, checks metadata inconsistencies, and flags manipulated audio/video clips.",
    category: "Blockchain & Cybersecurity",
  },
  {
    id: 17,
    title: "SIH1617: Direct-to-Consumer Market Access for Handloom Artisans with ONDC Integration",
    description: "E-commerce facilitation portal for rural handloom weavers featuring voice-assisted product listing, AI catalog generation, and ONDC protocol integration.",
    category: "Agriculture, FoodTech & Rural Development",
  },
  {
    id: 18,
    title: "SIH1618: Assistive Two-Way Sign Language to Speech Translation Device",
    description: "Wearable or camera-based real-time gesture recognition system converting Indian Sign Language (ISL) gestures to spoken audio and speech to animated ISL avatars.",
    category: "MedTech / Healthcare",
  },
  {
    id: 19,
    title: "SIH1619: Marine Litter & Coastal Plastic Accumulation Tracking via Satellite Data",
    description: "Remote sensing and drone imagery processing tool that maps marine debris concentration along coastlines and assists coastal clean-up task forces.",
    category: "Clean & Green Technology",
  },
  {
    id: 20,
    title: "SIH1620: Automated Zero-Day Vulnerability Scanning & Cloud Security Posture Auditor",
    description: "Automated scanner that assesses misconfigured cloud IAM policies, checks container vulnerabilities, and generates actionable remediation scripts for developers.",
    category: "Blockchain & Cybersecurity",
  },
  {
    id: 21,
    title: "SIH1621: Low-Cost Non-Invasive Anemia & Glucose Detection Device",
    description: "Smartphone-connected optical sensor that measures conjunctival pallor and fingertip photoplethysmography (PPG) to screen for hemoglobin and glucose levels.",
    category: "MedTech / Healthcare",
  },
  {
    id: 22,
    title: "SIH1622: AI-Powered Adaptive Exam Proctoring & Behavioral Analysis Platform",
    description: "Privacy-preserving online proctoring system that detects gaze deviation, secondary devices, and anomalous audio while running lightweight edge models on student laptops.",
    category: "Smart Education",
  },
  {
    id: 23,
    title: "SIH1623: Urban Groundwater Level Monitoring & Rainwater Harvesting Analytics",
    description: "IoT telemetry for residential and commercial borewells calculating recharge rates, water table decline, and recommending optimal rainwater harvesting structures.",
    category: "Clean & Green Technology",
  },
  {
    id: 24,
    title: "SIH1624: AI-Enabled Tourist Safety & Geo-Fenced SOS Alert System",
    description: "Wearable & mobile safety companion for travelers in remote areas featuring mesh networking, geo-fenced danger zones, and offline SOS beaconing.",
    category: "Travel & Heritage",
  },
  {
    id: 25,
    title: "SIH1625: Landslide Susceptibility Mapping & Early Warning Siren Network",
    description: "Soil moisture and slope displacement sensor network paired with geological rainfall threshold models to broadcast early evacuation alarms in hilly terrains.",
    category: "Disaster Management",
  },
  {
    id: 26,
    title: "SIH1626: Micro-Financing & Alternative Credit Scoring for Gig Workers & Street Vendors",
    description: "Alternative credit scoring platform analyzing UPI transaction velocity, utility payments, and delivery ratings to unlock low-interest microloans for unbanked workers.",
    category: "FinTech",
  },
  {
    id: 27,
    title: "SIH1627: Satellite-based Hyperlocal Air Quality Index (AQI) & Pollution Tracker",
    description: "Atmospheric data pipeline fusing Sentinel-5P satellite feeds with ground sensors to forecast particulate matter (PM2.5/PM10) distribution at street level.",
    category: "Space Technology",
  },
  {
    id: 28,
    title: "SIH1628: Autonomous Campus Delivery Bot with Obstacle Avoidance",
    description: "Compact 4-wheeled rover navigating university campuses using LiDAR, stereo vision, and GPS waypoints for secure last-yard parcel and document delivery.",
    category: "Robotics & Drones",
  },
];

export const SIH_DEFAULT_SKILLS = [
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

export const SIH_DEFAULT_ROLES = [
  "Frontend Developer", "Backend Developer", "Full-stack Developer",
  "UI/UX Designer", "AI/ML Engineer", "Data Scientist", "DevOps / Cloud Engineer",
  "Mobile App Developer", "Blockchain Developer", "IoT & Embedded Engineer",
  "Cybersecurity Specialist", "Project Manager / Lead", "QA & Testing Engineer",
];
export const DEFAULT_SKILLS = SIH_DEFAULT_SKILLS;
export const DEFAULT_ROLES = SIH_DEFAULT_ROLES;
