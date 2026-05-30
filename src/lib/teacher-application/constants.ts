export const TEACHING_SUBJECT_OPTIONS = [
  { id: "tajwid", label: "Tajwid (pronunciation rules)" },
  { id: "quran_recitation", label: "Quran recitation (tilawah)" },
  { id: "hifz", label: "Memorisation (hifz)" },
  { id: "arabic", label: "Arabic language" },
  { id: "islamic_studies", label: "Islamic studies basics" },
  { id: "kids_beginners", label: "Kids / beginners" },
  { id: "adults", label: "Adults" },
] as const;

export const STUDENT_LEVEL_OPTIONS = [
  { id: "complete_beginner", label: "Complete beginner (no Arabic/Quran yet)" },
  { id: "beginner", label: "Beginner (knows basics)" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
  { id: "kids_4_7", label: "Kids 4–7 years" },
  { id: "kids_8_12", label: "Kids 8–12 years" },
  { id: "teens", label: "Teenagers (13–17)" },
  { id: "adults_only", label: "Adults only" },
] as const;

export const LANGUAGE_MODE_OPTIONS = [
  { id: "malay", label: "Bahasa Melayu" },
  { id: "english", label: "English" },
  { id: "arabic", label: "Arabic" },
  { id: "urdu", label: "Urdu" },
  { id: "indonesian", label: "Bahasa Indonesia" },
  { id: "mandarin", label: "Mandarin" },
  { id: "hokkien", label: "Hokkien" },
] as const;

export const ID_DOCUMENT_OPTIONS = [
  { id: "IC", label: "Malaysian IC (MyKad)" },
  { id: "PASSPORT", label: "Passport" },
] as const;

export const HEARD_FROM_OPTIONS = [
  { id: "friend_family", label: "Friend or family" },
  { id: "social_media", label: "Social media (Facebook, Instagram, TikTok, etc.)" },
  { id: "google_search", label: "Google search" },
  { id: "mosque_community", label: "Mosque / community" },
  { id: "existing_teacher", label: "Another jomngaji.my teacher" },
  { id: "whatsapp", label: "WhatsApp group" },
  { id: "other", label: "Other" },
] as const;

export const TIMEZONE_OPTIONS = [
  { value: "Asia/Kuala_Lumpur", label: "Malaysia (Kuala Lumpur)" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Jakarta", label: "Indonesia (Jakarta)" },
  { value: "Asia/Brunei", label: "Brunei" },
  { value: "UTC", label: "UTC" },
] as const;

/** Sample code of conduct shown on the application form */
export const TEACHER_CODE_OF_CONDUCT = `jomngaji.my Teacher Code of Conduct (sample)

1. Professionalism — Be punctual for every class, dress modestly on camera, and maintain a calm, respectful tone with students and parents.

2. Accuracy & honesty — Teach within your qualifications. Do not claim ijazah or certifications you do not hold. Report any errors in platform materials to the admin team.

3. Child safety — Never request private contact outside the platform with minors. Do not share personal social media with students under 18. Report safeguarding concerns immediately.

4. Privacy — Do not record, screenshot, or share student sessions without written consent. Keep student and family data confidential.

5. Fair booking — Honour your published availability. Give reasonable notice if you must cancel. Do not solicit off-platform payments.

6. Islamic adab — Model good manners (adab) in speech and conduct. Avoid political debates or content unrelated to Quran learning during class time.

7. Platform rules — Use only approved meeting links issued by jomngaji.my. Follow admin decisions on disputes, refunds, and account status.

By applying, you agree to uphold this conduct if your application is approved. jomngaji.my may update these guidelines and will notify active teachers.`;

export type TeachingSubjectId = (typeof TEACHING_SUBJECT_OPTIONS)[number]["id"];
export type StudentLevelId = (typeof STUDENT_LEVEL_OPTIONS)[number]["id"];
export type LanguageModeId = (typeof LANGUAGE_MODE_OPTIONS)[number]["id"];
