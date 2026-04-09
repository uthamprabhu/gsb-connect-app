export const TAG_OPTIONS = [
  "Fitness",
  "Travel",
  "Tech",
  "Music",
  "Food",
  "Books",
  "Movies",
  "Gaming",
  "Startup",
  "Art",
] as const;

export const GENDER_OPTIONS = ["male", "female", "other"] as const;
export const PREFERENCE_OPTIONS = ["male", "female", "any"] as const;

export type Gender = (typeof GENDER_OPTIONS)[number];
export type Preference = (typeof PREFERENCE_OPTIONS)[number];
