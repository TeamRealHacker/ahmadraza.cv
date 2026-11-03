/**
 * Selected projects from https://realhackers.pages.dev/ — the weaker two
 * (Knight HQ, MK Fashion Store) were removed at the owner's request.
 * #02 is Kite, the owner's Flutter + Firebase 1:1 messenger (verified
 * 2026-11-03 from kite_app.rar: Flutter source, Firebase backend, web admin,
 * docs screenshots; it runs in demo mode until a Firebase project is
 * connected, and its showcase video is a slideshow of its own screenshots).
 */
export type Project = {
  slug: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  longDescription: string;
  highlights: string[];
  image: string;
  href: string;
  stack: string[];
  year: string;
  role: string;
  client: string;
  featured: boolean;
  accent: string;
};

export const projects: Project[] = [
  {
    slug: "centerface-ai",
    number: "01",
    title: "Centerface Ai",
    tagline: "AI video editor",
    description:
      "An AI video editor with face, nose and point tracking. Lock onto anything and follow it through every frame — 4K, 60fps, HDR, right in the browser with nothing uploaded.",
    longDescription:
      "CenterFace Ai is an AI video editor built around precision tracking. Click a face, a nose, a wheel — CenterFace follows it through every frame, right in your browser, with nothing uploaded. The studio interface puts a live REC timeline, AE/AF lock, 4K/60/HDR readout and face / nose / point tracking controls in one calm, dark canvas. Everything runs locally so footage never leaves the machine.",
    highlights: ["Face, nose & point tracking", "Live REC timeline with AE / AF lock", "4K · 60fps · HDR readout", "Browser-based — nothing is uploaded", "Dark editorial studio interface"],
    image: "/images/centerface-ai.webp",
    href: "https://centerface.web.app",
    stack: ["AI", "Motion", "Video", "Design & Build"],
    year: "2026",
    role: "Design & Build",
    client: "Personal project",
    featured: true,
    accent: "#eab308",
  },
  {
    slug: "kite",
    number: "02",
    title: "Kite",
    tagline: "1:1 messenger · Flutter + Firebase",
    description:
      "Kite is a light, fast one-to-one messenger for Android — chats, people, reactions, replies, themes and an admin dashboard, built with Flutter and Firebase. It runs in demo mode until a Firebase project is connected.",
    longDescription:
      "Kite 2.0 is a light, fast one-to-one messenger for Android, built with Flutter and Firebase. It covers the full messenger loop: register and sign in, a chats list with pin, mute, archive and search, real-time 1:1 text and photo messaging with replies, reactions, message editing and deletion, typing indicators and read receipts, plus people search, contact profiles, block and report, light/dark themes with accent colours and wallpapers, and an in-app and web admin dashboard. The app currently runs in demo mode with sample chats — server actions connect once a Firebase project is added.",
    highlights: ["1:1 text & photo messaging", "Replies, reactions, edit & delete", "Typing indicators & read receipts", "Pin, mute, archive & chat search", "Light/dark themes & admin dashboard"],
    image: "/images/kite-app.webp",
    href: "",
    stack: ["Flutter", "Firebase", "Android", "Dart"],
    year: "2026",
    role: "Design & Build",
    client: "Personal project",
    featured: true,
    accent: "#a3e635",
  },
  {
    slug: "auto-max",
    number: "03",
    title: "Auto Max",
    tagline: "Autonomous content generator",
    description:
      "AI-powered YouTube Shorts automation. Give it a channel or video link and it fetches, analyses, finds the best segments and generates ready-to-publish short-form clips automatically.",
    longDescription:
      "Automax is an automated video content generation platform that transforms long-form YouTube videos into ready-to-publish short-form content. Simply provide a channel link or individual video links: it fetches the videos, analyses and extracts relevant content, identifies suitable short-form segments, creates multiple engaging Shorts and automates the whole clipping workflow. Goal: turn long videos into short, engaging content with minimal manual editing. Core focus: YouTube Automation, AI Video Processing, Short-Form Content and Automated Video Generation.",
    highlights: ["Fetches YouTube channels & videos", "Analyses and extracts relevant content", "Finds the best short-form segments", "Generates multiple Shorts automatically", "End-to-end clipping automation"],
    image: "/images/auto-max.webp",
    href: "https://aut0max.web.app/",
    stack: ["Vite", "AI", "YouTube Automation", "Video"],
    year: "2025",
    role: "Design & Build",
    client: "Personal project",
    featured: true,
    accent: "#f5f5f5",
  },
  {
    slug: "realxrtts",
    number: "04",
    title: "RealXrTTs",
    tagline: "Text to realistic speech",
    description:
      "An advanced text-to-speech tool that turns written text into natural, expressive, human-like speech — clear lifelike audio for apps, content creation and AI assistants.",
    longDescription:
      "Real XR TTS is an advanced, realistic text-to-speech solution designed to transform written text into natural, expressive, human-like speech. Built for high-quality voice generation, it delivers clear, lifelike audio for applications, content creation, AI assistants and more. The interface is deliberately minimal: one canvas, one voice, no gimmick panels — 'Voice Beyond Reality'.",
    highlights: ["Natural, expressive voice output", "Built for AI assistants & content creation", "Clean single-purpose interface", "High-quality, low-latency generation"],
    image: "/images/realxrtts.webp",
    href: "https://real-xr-tts-3o8s.vercel.app/",
    stack: ["React", "AI", "Text to Speech"],
    year: "2026",
    role: "Design & Build",
    client: "Personal project",
    featured: true,
    accent: "#ef4444",
  },
  {
    slug: "danger-agent-x",
    number: "05",
    title: "Danger Agent X",
    tagline: "Real AI OSINT tool",
    description:
      "An AI-powered cybersecurity agent for digital investigation, threat analysis and security automation. Incident analysis, forensics, vulnerability discovery and agentic PC automation.",
    longDescription:
      "Danger Agent X is an AI-powered cybersecurity agent designed for digital investigation, threat analysis and security automation. It can analyse security incidents, investigate suspicious activity, assist with digital forensics, identify potential vulnerabilities and automate repetitive cybersecurity tasks. Built with an agentic workflow, it combines AI reasoning, investigation skills and PC-based automation to help users understand and respond to cyber threats more efficiently — all inside a clean command centre with an active-tool dashboard.",
    highlights: ["Incident & threat analysis", "Digital forensics assistance", "Vulnerability discovery", "Agentic PC-based automation", "Active tools dashboard"],
    image: "/images/danger-agent-x.webp",
    href: "http://dangeragentx.web.app/",
    stack: ["AI", "OSINT", "Cybersecurity", "Automation"],
    year: "2026",
    role: "Design & Build",
    client: "Personal project",
    featured: true,
    accent: "#ef4444",
  },
  {
    slug: "minal-enterprises",
    number: "06",
    title: "Minal Enterprises",
    tagline: "Printing, Packaging & Finishing — Faisalabad",
    description:
      "Website for a printing press and packaging house in Dhuddi Wala, Faisalabad — offset and digital printing, letterpress, rigid boxes, wedding cards, labels, foil stamping and satin ribbon printing.",
    longDescription:
      "Minal Enterprises is a printing press and packaging house based in Dhuddi Wala, Faisalabad. The business handles offset and digital printing, letterpress, rigid and fancy boxes, wedding cards, labels and stickers, foil stamping, mailer packaging, hang tags, and custom woven and satin ribbon printing. Its production workflow covers printing, foil, die-cutting and finishing in-house. The site turns that full catalogue into a clean, typographic storefront that loads fast on any connection.",
    highlights: ["Offset, digital & letterpress printing", "Rigid boxes, wedding cards & labels", "Foil stamping & mailer packaging", "Satin ribbon and hang tags", "Fast, typographic storefront"],
    image: "/images/minal-enterprises.webp",
    href: "https://minalenterprises.org/",
    stack: ["Web Development", "Printing", "Packaging", "Faisalabad"],
    year: "2026",
    role: "Design & Build",
    client: "Minal Enterprises",
    featured: true,
    accent: "#e8392e",
  },
  {
    slug: "tark-place",
    number: "07",
    title: "Tark Place",
    tagline: "Premium e-commerce",
    description:
      "A modern e-commerce platform for a wireless audio brand — luxury tech aesthetic, product browsing, search, shopping bag, customer accounts, promotional campaigns and an optimised checkout with Cash on Delivery.",
    longDescription:
      "TarkPlace is a modern premium e-commerce platform built for a wireless audio brand, combining a luxury tech aesthetic with a smooth online shopping experience. The work covered the website's UI, visual direction, responsive layout, navigation, product presentation and the whole e-commerce experience: product browsing, search, shopping bag, customer accounts, promotional campaigns, support and an optimised purchase flow with Cash on Delivery, free shipping and 30-day returns.",
    highlights: ["Product browsing, search & shopping bag", "Customer accounts & campaigns", "Optimised Cash-on-Delivery checkout", "Free shipping & 30-day returns", "Responsive luxury tech design"],
    image: "/images/tark-place.webp",
    href: "",
    stack: ["E-commerce", "UI/UX Design", "Frontend", "Branding"],
    year: "2026",
    role: "E-commerce",
    client: "Zain Ali",
    featured: true,
    accent: "#3046e8",
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
