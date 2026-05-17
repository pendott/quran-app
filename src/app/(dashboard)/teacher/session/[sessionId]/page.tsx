import { AttendanceStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { completeClassSessionAction, startClassSessionAction, updateSessionAttendanceAction } from "@/app/actions/session";
import { MeetingJoinLink } from "@/components/dashboard/meeting-join-link";
import { SectionCard } from "@/components/dashboard/section-card";
import { ClassNoteEditor } from "@/components/teacher/class-note-editor";
import { RecordingEditor } from "@/components/teacher/recording-editor";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/db";
import { getTeacherByUserId } from "@/server/queries/teacher";

type Props = { params: Promise<{ sessionId: string }> };

export default async function TeacherSessionPage({ params }: Props) {
  const { sessionId } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const teacher = await getTeacherByUserId(session.user.id);
  if (!teacher) notFound();

  const cs = await prisma.classSession.findUnique({
    where: { id: sessionId },
    include: {
      student: true,
      booking: true,
      meetingLink: true,
      note: true,
      recording: true,
    },
  });
  if (!cs || cs.teacherId !== teacher.id) notFound();

  const defaults = {
    lastSurah: cs.note?.lastSurah ?? "",
    lastAyahFrom: cs.note?.lastAyahFrom ?? "",
    lastAyahTo: cs.note?.lastAyahTo ?? "",
    homework: cs.note?.homework ?? "",
    nextTarget: cs.note?.nextTarget ?? "",
    summary: cs.note?.summary ?? "",
  };

  const recordingDefaults = {
    title: cs.recording?.title ?? "Class recording",
    playbackUrl: cs.recording?.playbackUrl ?? "",
    durationSeconds: cs.recording?.durationSeconds != null ? String(cs.recording.durationSeconds) : "",
    visibleToFamily: cs.recording?.visibleToFamily ?? true,
  };

  const attOptions = Object.values(AttendanceStatus);

  return (
    <div className="space-y-6">
      <SectionCard
        title={`Session · ${cs.student.displayName}`}
        description={`${formatDateTime(cs.scheduledStartAt)} · Status: ${cs.status}`}
      >
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Meeting link</p>
          <MeetingJoinLink
            joinUrl={cs.meetingLink?.joinUrl}
            provider={cs.meetingLink?.provider}
            pendingReason="No link — ask admin to confirm booking or check Zoom settings"
          />
          {cs.meetingLink?.joinUrl ? (
            <p className="mt-2 break-all font-mono text-[11px] text-slate-500">{cs.meetingLink.joinUrl}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={startClassSessionAction}>
            <input type="hidden" name="sessionId" value={sessionId} />
            <button
              type="submit"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Start class
            </button>
          </form>
          <form action={completeClassSessionAction}>
            <input type="hidden" name="sessionId" value={sessionId} />
            <button
              type="submit"
              className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500"
            >
              Mark complete
            </button>
          </form>
          <Link href="/teacher/classes" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 underline">
            Back to classes
          </Link>
        </div>
      </SectionCard>

      <SectionCard title="Attendance" description="Update attendance before or after the class ends.">
        <div className="grid gap-4 sm:grid-cols-2">
          <form action={updateSessionAttendanceAction} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <input type="hidden" name="sessionId" value={sessionId} />
            <input type="hidden" name="target" value="teacher" />
            <p className="mb-2 text-sm font-medium text-slate-800">Teacher</p>
            <select
              name="value"
              defaultValue={cs.teacherAttendance}
              className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {attOptions.map((v) => (
                <option key={v} value={v}>
                  {v.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
              Save teacher
            </button>
          </form>
          <form action={updateSessionAttendanceAction} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <input type="hidden" name="sessionId" value={sessionId} />
            <input type="hidden" name="target" value="student" />
            <p className="mb-2 text-sm font-medium text-slate-800">Student</p>
            <select
              name="value"
              defaultValue={cs.studentAttendance}
              className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {attOptions.map((v) => (
                <option key={v} value={v}>
                  {v.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
              Save student
            </button>
          </form>
        </div>
      </SectionCard>

      <SectionCard title="Class note" description="Saved to the student timeline and family portal.">
        <ClassNoteEditor sessionId={sessionId} defaults={defaults} />
      </SectionCard>

      <SectionCard
        title="Recording"
        description="Paste a hosted playback URL (Drive, Vimeo, etc.). Families see this when “visible” is checked."
      >
        <RecordingEditor sessionId={sessionId} defaults={recordingDefaults} />
      </SectionCard>
    </div>
  );
}
