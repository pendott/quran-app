const formFields = [
  { label: "Last surah", value: "Al-Mulk" },
  { label: "Last ayah", value: "1-12" },
  { label: "Tajwid mistake", value: "Madd length consistency" },
  { label: "Next target", value: "Ayah 13-18" },
];

export function ClassNoteFormPreview() {
  return (
    <div className="space-y-4 rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        {formFields.map((field) => (
          <label key={field.label} className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{field.label}</span>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              {field.value}
            </div>
          </label>
        ))}
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Homework</span>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
          Listen to the recording once, repeat ayah 1-12 three times, and focus on qaf articulation before the next class.
        </div>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Class summary</span>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
          Strong confidence today. Parent summary and reminder workflow can be dispatched after the teacher submits this note.
        </div>
      </label>
    </div>
  );
}
