export const profile = {
  name: "JAY SZRS",
  fullName: "Jaelani Surya Saputra",
  role: "Creative Technologist • Informatics Student • Designer • Content Creator",
  email: "jaelanisuryasaputra@gmail.com",
  whatsapp: "62895330152658",
  location: "Indonesia",
  status: "Available for collaboration",
  typing: [
    "I build digital experiences.",
    "I design creative interfaces.",
    "I explore IT, design, and technology.",
    "I create meaningful visual stories.",
  ],
};

export const stats = [
  { label: "Projects", value: 24 },
  { label: "Certificates", value: 18 },
  { label: "Designs", value: 60 },
  { label: "Volunteer", value: 7 },
];

export const experiences: { title: string; company: string; date: string; status: string; description: string; category: string; imageUrl?: string; documentUrl?: string }[] = [
  {
    title: "Graphic Designer",
    company: "National Poster Competition",
    date: "2024",
    status: "Completed",
    description: "Designed creative posters that won national-level recognition for visual storytelling.",
    category: "Design",
  },
  {
    title: "UI/UX Designer",
    company: "Campus Tech Project",
    date: "2024 – Present",
    status: "Active",
    description: "Designed end-to-end interfaces for a student management web platform with focus on accessibility.",
    category: "Design",
  },
  {
    title: "Content Creator",
    company: "Personal Branding",
    date: "2023 – Present",
    status: "Active",
    description: "Producing visual & video content around tech, study journey, and creative tutorials.",
    category: "Content",
  },
  {
    title: "Network Lab Assistant",
    company: "Universitas Bani Saleh",
    date: "2024",
    status: "Completed",
    description: "Assisted students in subnetting, Cisco Packet Tracer labs, and basic network configuration.",
    category: "IT",
  },
];

export const certifications = [
  { title: "UI/UX Fundamentals", issuer: "Dicoding", year: "2024", category: "Design" },
  { title: "Cisco Networking Basics", issuer: "Cisco NetAcad", year: "2024", category: "IT" },
  { title: "Java Programming", issuer: "Coursera", year: "2023", category: "Programming" },
  { title: "Cyber Security Essentials", issuer: "Cisco", year: "2024", category: "Cyber Security" },
  { title: "Graphic Design Mastery", issuer: "Skillshare", year: "2023", category: "Design" },
  { title: "National Poster Award", issuer: "National Comp.", year: "2024", category: "Competition" },
];

export const education: { institution: string; major: string; period: string; description: string; logoUrl?: string; documentUrl?: string }[] = [
  {
    institution: "Universitas Bani Saleh",
    major: "Informatics Engineering",
    period: "2023 – Present",
    description: "Focus on Programming, Networking, Database, UI/UX, and Cyber Security basics.",
  },
  {
    institution: "SMK / High School",
    major: "Computer & Network Engineering",
    period: "2020 – 2023",
    description: "Foundation in IT, networking, hardware, and basic programming.",
  },
];

export const volunteers: { name: string; role: string; year: string; category: string; description?: string; imageUrl?: string; documentUrl?: string }[] = [
  { name: "Campus Open House", role: "Documentation Team", year: "2024", category: "Committee" },
  { name: "Tech Workshop", role: "Co-Facilitator", year: "2024", category: "Event" },
  { name: "Creative Community", role: "Designer", year: "2023", category: "Community" },
];

export const projects: { name: string; category: string; year: string; stack: string[]; description: string; thumbnailUrl?: string; demoUrl?: string; githubUrl?: string; documentationUrl?: string }[] = [
  { name: "UI_UX_Design.case", category: "UI/UX", year: "2024", stack: ["Figma", "React"], description: "Student dashboard concept with neon dark theme." },
  { name: "Web_Development.project", category: "Web", year: "2024", stack: ["React", "Tailwind"], description: "Personal landing page with parallax & smooth animations." },
  { name: "Graphic_Design.gallery", category: "Design", year: "2023", stack: ["Photoshop", "Illustrator"], description: "Curated poster & branding works." },
  { name: "Video_Editing.reel", category: "Video", year: "2024", stack: ["Premiere", "CapCut"], description: "Short-form content reels for personal branding." },
  { name: "Network_Config.lab", category: "Network", year: "2024", stack: ["Cisco PT"], description: "Subnetting & VLAN simulation labs." },
  { name: "Java_App.exec", category: "Programming", year: "2023", stack: ["Java", "NetBeans", "MySQL"], description: "Inventory desktop app with MySQL backend." },
];

export const skills = {
  Technical: ["HTML", "CSS", "JavaScript", "React.js", "PHP", "MySQL", "Java", "Networking", "Subnetting", "Cyber Security"],
  Creative: ["UI/UX Design", "Graphic Design", "Poster Design", "Video Editing", "Content Creation", "Branding"],
  Tools: ["Figma", "Canva", "Photoshop", "Illustrator", "CapCut", "Premiere Pro", "VS Code", "NetBeans", "Cisco PT", "GitHub"],
};

export const navItems = [
  { id: "home", label: "home" },
  { id: "lanyard", label: "lanyard" },
  { id: "about", label: "about" },
  { id: "experience", label: "experience" },
  { id: "certification", label: "certs" },
  { id: "education", label: "education" },
  { id: "volunteer", label: "volunteer" },
  { id: "projects", label: "projects" },
  { id: "skills", label: "skills" },
  { id: "contact", label: "contact" },
];
