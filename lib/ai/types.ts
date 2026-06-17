/** Shape of the current published portfolio handed to the AI for diffing. */
export type PortfolioSnapshot = {
  profile: Record<string, unknown> | null;
  skills: Array<Record<string, unknown>>;
  projects: Array<Record<string, unknown>>;
  experience: Array<Record<string, unknown>>;
  education: Array<Record<string, unknown>>;
  certifications: Array<Record<string, unknown>>;
  achievements: Array<Record<string, unknown>>;
};
