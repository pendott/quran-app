export type ProposedAvailabilitySlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
};

export type ProposedAvailability = {
  timezone: string;
  slots: ProposedAvailabilitySlot[];
};

export function labelTeachingSubject(id: string) {
  const map: Record<string, string> = {
    tajwid: "Tajwid",
    quran_recitation: "Quran recitation",
    hifz: "Hifz",
    arabic: "Arabic",
    islamic_studies: "Islamic studies",
    kids_beginners: "Kids / beginners",
    adults: "Adults",
  };
  return map[id] ?? id;
}

export function labelLanguageMode(id: string) {
  const map: Record<string, string> = {
    malay: "Bahasa Melayu",
    english: "English",
    arabic: "Arabic",
    urdu: "Urdu",
    indonesian: "Bahasa Indonesia",
  };
  return map[id] ?? id;
}

export function labelStudentLevel(id: string) {
  const map: Record<string, string> = {
    complete_beginner: "Complete beginner",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    kids_4_7: "Kids 4–7",
    kids_8_12: "Kids 8–12",
    teens: "Teenagers",
    adults_only: "Adults only",
  };
  return map[id] ?? id;
}

export function labelIdDocumentType(type: string) {
  return type === "IC" ? "Malaysian IC" : type === "PASSPORT" ? "Passport" : type;
}

export function labelHeardFrom(id: string, other?: string | null) {
  const map: Record<string, string> = {
    friend_family: "Friend or family",
    social_media: "Social media",
    google_search: "Google search",
    mosque_community: "Mosque / community",
    existing_teacher: "Another teacher",
    whatsapp: "WhatsApp group",
    other: other ? `Other: ${other}` : "Other",
  };
  return map[id] ?? id;
}
