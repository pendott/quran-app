import type { Stat, TableRow, TimelineItem } from "@/lib/types";

export const adminStats: Stat[] = [
  { label: "Total students", value: "128", change: "+12 this month", tone: "emerald" },
  { label: "Total teachers", value: "16", change: "12 currently active", tone: "sky" },
  { label: "Revenue", value: "RM 18,240", change: "+8.4% vs last month", tone: "violet" },
  { label: "Pending payments", value: "9", change: "3 require follow-up today", tone: "amber" },
];

export const teacherStats: Stat[] = [
  { label: "Today’s classes", value: "5", change: "Next class in 35 mins", tone: "sky" },
  { label: "Assigned students", value: "18", change: "4 new this quarter", tone: "emerald" },
  { label: "Notes pending", value: "2", change: "Finish before 9:00 PM", tone: "amber" },
  { label: "Attendance rate", value: "96%", change: "Trailing 30 days", tone: "violet" },
];

export const studentStats: Stat[] = [
  { label: "Next class", value: "Today 7:30 PM", change: "Ustaz Ahmad", tone: "sky" },
  { label: "Package balance", value: "5 credits", change: "Expires in 24 days", tone: "emerald" },
  { label: "Completed sessions", value: "22", change: "4 this month", tone: "violet" },
  { label: "Unread notes", value: "3", change: "Latest from yesterday", tone: "amber" },
];

export const upcomingClassRows: TableRow[] = [
  { Student: "Aisyah Musa", Teacher: "Ustaz Ahmad", Time: "Today, 7:30 PM", Plan: "8-session package", Status: "Confirmed" },
  { Student: "Yusuf Hakim", Teacher: "Ustazah Huda", Time: "Today, 8:30 PM", Plan: "Per session", Status: "Pending payment" },
  { Student: "Sarah Iman", Teacher: "Ustaz Imran", Time: "Tomorrow, 5:00 PM", Plan: "Monthly package", Status: "Confirmed" },
];

export const pendingPaymentRows: TableRow[] = [
  { Invoice: "INV-1008", Student: "Yusuf Hakim", Amount: "RM 45.00", Method: "ToyyibPay", Status: "Awaiting callback" },
  { Invoice: "INV-1009", Student: "Adam Danish", Amount: "RM 180.00", Method: "Billplz", Status: "Payment link sent" },
  { Invoice: "INV-1010", Student: "Hana Zulaikha", Amount: "RM 320.00", Method: "Stripe", Status: "Pending approval" },
];

export const teacherDirectoryRows: TableRow[] = [
  { Teacher: "Ustaz Ahmad", Specialty: "Tajwid & memorization", Timezone: "Asia/Kuala_Lumpur", Students: "18", Availability: "Open" },
  { Teacher: "Ustazah Huda", Specialty: "Beginner recitation", Timezone: "Asia/Singapore", Students: "14", Availability: "Limited" },
  { Teacher: "Ustaz Imran", Specialty: "Advanced revision", Timezone: "Asia/Kuala_Lumpur", Students: "11", Availability: "Open" },
];

export const studentDirectoryRows: TableRow[] = [
  { Student: "Aisyah Musa", Parent: "Nur Aina", Teacher: "Ustaz Ahmad", Progress: "Al-Mulk 1-12", Status: "Active" },
  { Student: "Yusuf Hakim", Parent: "Hakim Roslan", Teacher: "Ustazah Huda", Progress: "Iqra 5", Status: "Trial" },
  { Student: "Sarah Iman", Parent: "Iman Faiz", Teacher: "Ustaz Imran", Progress: "Yasin 22-38", Status: "Active" },
];

export const bookingRows: TableRow[] = [
  { Booking: "BK-3021", Student: "Aisyah Musa", Teacher: "Ustaz Ahmad", Slot: "Mon, 7:30 PM", Source: "Package credit", Status: "Confirmed" },
  { Booking: "BK-3022", Student: "Yusuf Hakim", Teacher: "Ustazah Huda", Slot: "Tue, 8:30 PM", Source: "ToyyibPay", Status: "Pending payment" },
  { Booking: "BK-3023", Student: "Sarah Iman", Teacher: "Ustaz Imran", Slot: "Wed, 5:00 PM", Source: "Monthly package", Status: "Rescheduled" },
];

export const paymentRows: TableRow[] = [
  { Payment: "PY-4451", Student: "Aisyah Musa", Amount: "RM 320.00", Gateway: "Billplz", Purpose: "8-session package", Status: "Paid" },
  { Payment: "PY-4452", Student: "Yusuf Hakim", Amount: "RM 45.00", Gateway: "ToyyibPay", Purpose: "Single class", Status: "Pending" },
  { Payment: "PY-4453", Student: "Sarah Iman", Amount: "RM 180.00", Gateway: "Stripe", Purpose: "4-session package", Status: "Refunded" },
];

export const todayScheduleRows: TableRow[] = [
  { Time: "6:30 PM", Student: "Aisyah Musa", Topic: "Al-Mulk revision", Join: "Zoom ready", Status: "Confirmed" },
  { Time: "7:30 PM", Student: "Adam Danish", Topic: "Iqra fluency", Join: "Zoom ready", Status: "Starts soon" },
  { Time: "8:30 PM", Student: "Hana Zulaikha", Topic: "Yasin memorization", Join: "Manual link", Status: "Waiting payment" },
];

export const teacherStudentRows: TableRow[] = [
  { Student: "Aisyah Musa", LastClass: "Yesterday", LastSurah: "Al-Mulk", Focus: "Makharij", Homework: "Repeat ayah 1-12" },
  { Student: "Adam Danish", LastClass: "2 days ago", LastSurah: "Iqra 5", Focus: "Mad asli", Homework: "1 page fluency" },
  { Student: "Hana Zulaikha", LastClass: "Last week", LastSurah: "Yasin", Focus: "Stops and starts", Homework: "Memorize 3 ayah" },
];

export const studentBookingRows: TableRow[] = [
  { Slot: "Mon, 7:30 PM", Teacher: "Ustaz Ahmad", Package: "Use 1 credit", Meeting: "Auto-create Zoom", Status: "Best match" },
  { Slot: "Tue, 8:30 PM", Teacher: "Ustazah Huda", Package: "Pay per session", Meeting: "Auto-create Zoom", Status: "Available" },
  { Slot: "Thu, 5:00 PM", Teacher: "Ustaz Imran", Package: "Monthly package", Meeting: "Auto-create Zoom", Status: "Few seats left" },
];

export const recordingRows: TableRow[] = [
  { Date: "12 May", Session: "Al-Mulk revision", Teacher: "Ustaz Ahmad", Access: "Ready", Notes: "Summary attached" },
  { Date: "9 May", Session: "Iqra fluency", Teacher: "Ustazah Huda", Access: "Ready", Notes: "Homework updated" },
  { Date: "5 May", Session: "Yasin memorization", Teacher: "Ustaz Imran", Access: "Processing", Notes: "Upload pending" },
];

export const studentPaymentRows: TableRow[] = [
  { Date: "10 May", Item: "8-session package", Amount: "RM 320.00", Method: "Billplz", Status: "Paid" },
  { Date: "2 May", Item: "Single class", Amount: "RM 45.00", Method: "ToyyibPay", Status: "Paid" },
  { Date: "28 Apr", Item: "Refund adjustment", Amount: "RM 45.00", Method: "Stripe", Status: "Refunded" },
];

export const progressTimeline: TimelineItem[] = [
  {
    title: "Al-Mulk 1-12 revised with stronger pacing",
    description: "Teacher noted improved breath control and more confident elongation on longer ayah endings.",
    meta: "12 May · Tajwid focus: madd and qalqalah",
  },
  {
    title: "Yasin 22-26 introduced",
    description: "New target added with repeat-after-teacher pattern and slower transition between ayah markers.",
    meta: "9 May · Homework: memorize 3 ayah",
  },
  {
    title: "Makharij correction on qaf and kaf",
    description: "Parent was advised to review articulation with the provided recording before the next session.",
    meta: "5 May · Teacher note shared",
  },
];
