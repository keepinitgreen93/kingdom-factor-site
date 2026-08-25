export interface NewsletterIssue {
  slug: string;
  month: string;
  publishedLabel: string;
  title: string;
  description: string;
  subject: string;
  preheader: string;
  theme: string;
  quote: string;
  signs: { title: string; text: string }[];
  shifts: { from: string; to: string }[];
  practice: { title: string; text: string }[];
  resource: { title: string; text: string; href: string; label: string };
}

export const newsletters: NewsletterIssue[] = [
  {
    slug: "august-2026",
    month: "August 2026",
    publishedLabel: "Monthly Leadership Letter · August 2026",
    title: "The Leadership Weight You Were Never Meant to Carry Alone",
    description:
      "Three signs of hidden leadership isolation and one practical step toward a wiser room, drawn from Stop Leading Alone.",
    subject: "The Leadership Weight You Were Never Meant to Carry Alone",
    preheader:
      "This month: three signs of hidden leadership isolation and one practical step toward a wiser room.",
    theme: "Strong leadership is not silent endurance. It is learning to carry responsibility with truth, wise counsel, and trusted support.",
    quote: "There is a difference between carrying responsibility and carrying it alone.",
    signs: [
      {
        title: "Important decisions stay private too long.",
        text: "You process high-stakes choices alone until your options feel narrow and the pressure feels personal.",
      },
      {
        title: "You appear steady while becoming reactive.",
        text: "Your competence is still visible, while urgency, fatigue, or frustration is quietly directing your pace.",
      },
      {
        title: "People know your results, not your reality.",
        text: "You have many relationships and few places where you can speak honestly about what leadership is costing you.",
      },
    ],
    shifts: [
      { from: "isolation", to: "connection" },
      { from: "control", to: "collaboration" },
      { from: "performance", to: "purpose" },
      { from: "knowledge", to: "wisdom" },
      { from: "success", to: "legacy" },
    ],
    practice: [
      {
        title: "Name the weight.",
        text: "Say, “Here is the leadership issue I have been carrying privately.”",
      },
      {
        title: "Invite perspective.",
        text: "Ask, “What might I be missing, avoiding, or assuming?”",
      },
      {
        title: "Choose one faithful step.",
        text: "Decide what you will do, say, stop, or seek next.",
      },
      {
        title: "Schedule follow-up.",
        text: "Give the relationship permission to ask what happened.",
      },
    ],
    resource: {
      title: "Do I Have a Wiser Room?",
      text: "Use this practical readiness checklist to consider whether your current relationships offer truth, perspective, challenge, encouragement, and spiritually grounded counsel.",
      href: "/stop-leading-alone-free-resources/#why-leaders-need-a-wiser-room",
      label: "Open the Wiser Room resource",
    },
  },
];

export const newsletterBySlug = (slug: string | undefined) =>
  newsletters.find((issue) => issue.slug === slug);
