const weeklySlots = [
  {
    day: "Mon",
    date: "19 May",
    slots: [
      { time: "5:00 PM", status: "Open", tone: "bg-emerald-50 text-emerald-700" },
      { time: "7:30 PM", status: "Recommended", tone: "bg-sky-50 text-sky-700" },
    ],
  },
  {
    day: "Tue",
    date: "20 May",
    slots: [
      { time: "6:30 PM", status: "Open", tone: "bg-emerald-50 text-emerald-700" },
      { time: "8:30 PM", status: "Few seats", tone: "bg-amber-50 text-amber-700" },
    ],
  },
  {
    day: "Thu",
    date: "22 May",
    slots: [
      { time: "5:00 PM", status: "Monthly package", tone: "bg-violet-50 text-violet-700" },
      { time: "7:00 PM", status: "Open", tone: "bg-emerald-50 text-emerald-700" },
    ],
  },
];

export function BookingCalendarPreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {weeklySlots.map((column) => (
        <div key={column.day} className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{column.day}</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">{column.date}</p>
          </div>
          <div className="space-y-3">
            {column.slots.map((slot) => (
              <div key={slot.time} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-950">{slot.time}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${slot.tone}`}>
                    {slot.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">Checks teacher availability, payment source, and Zoom creation.</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
