/**
 * Experience — only what Ahmad has actually given.
 *
 * Team RealHackers Founder & Full-Stack Developer, Jan 2024–Present, comes
 * from his LinkedIn and is already used on the site. For WASA and Minal
 * Enterprises he has NOT given job titles, dates, or duties, so those
 * entries deliberately carry none — they say "Worked with" only. Do not
 * invent dates or roles here; Ahmad can send them to fill the gaps.
 * TarkPlace is intentionally NOT in this list.
 */
export type ExperienceEntry = {
  org: string;
  role: string;
  period?: string;
  location: string;
  sector?: string;
  note: string;
};

export const EXPERIENCE: ExperienceEntry[] = [
  {
    org: "Team RealHackers",
    role: "Founder & Full-Stack Developer",
    period: "Jan 2024–Present",
    location: "Faisalabad, Pakistan",
    note: "Design & engineering studio — websites, AI tools, software and automation.",
  },
  {
    org: "WASA",
    role: "Worked with",
    location: "Faisalabad, Pakistan",
    sector: "Government",
    note: "Worked with the Water and Sanitation Agency (WASA), Faisalabad.",
  },
  {
    org: "Minal Enterprises",
    role: "Worked with",
    location: "Faisalabad, Pakistan",
    note: "Worked with Minal Enterprises — printing, packaging & finishing.",
  },
];
