"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  adminApproveTeacherApplicationAction,
  adminRejectTeacherApplicationAction,
  type AdminApplicationActionState,
} from "@/app/actions/teacher-application-admin";

const initial: AdminApplicationActionState = { ok: false, error: null };

type Props = {
  application: {
    id: string;
    status: string;
    name: string;
    legalName: string;
    idDocumentTypeLabel: string;
    idDocumentNumber: string;
    email: string;
    phone: string | null;
    age: number;
    qualifications: string;
    experienceYears: number;
    maxStudentsPerWeek: number;
    about: string;
    photoPath: string | null;
    certificationPath: string | null;
    timezone: string;
    teachingSubjectLabels: string[];
    studentLevelLabels: string[];
    languageLabels: string[];
    heardFromLabel: string;
    availabilitySummary: string;
    confirmedAccurate: boolean;
    confirmedCodeOfConduct: boolean;
    consentBackgroundCheck: boolean;
    createdAt: Date;
    rejectionReason: string | null;
    createdTeacherId: string | null;
  };
};

export function TeacherApplicationReview({ application }: Props) {
  const [approveState, approveAction, approvePending] = useActionState(adminApproveTeacherApplicationAction, initial);
  const [rejectState, rejectAction, rejectPending] = useActionState(adminRejectTeacherApplicationAction, initial);

  const isPending = application.status === "PENDING";

  return (
    <div className="space-y-8">
      {approveState.ok ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Teacher account created. Share the password you set with {application.email}.
          {application.createdTeacherId ? (
            <>
              {" "}
              <Link href={`/admin/teachers/${application.createdTeacherId}/edit`} className="font-semibold underline">
                Open teacher profile
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
      {rejectState.ok ? (
        <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
          Application marked as rejected.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-6">
        {application.photoPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={application.photoPath}
            alt={application.name}
            className="h-32 w-32 rounded-2xl border border-slate-200 object-cover"
          />
        ) : null}
        <div className="min-w-0 flex-1 space-y-2 text-sm text-slate-700">
          <p>
            <span className="font-semibold text-slate-900">Status:</span> {application.status}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Display name:</span> {application.name}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Legal name:</span> {application.legalName}
          </p>
          <p>
            <span className="font-semibold text-slate-900">{application.idDocumentTypeLabel}:</span>{" "}
            {application.idDocumentNumber}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Email:</span> {application.email}
          </p>
          {application.phone ? (
            <p>
              <span className="font-semibold text-slate-900">Phone:</span> {application.phone}
            </p>
          ) : null}
          <p>
            <span className="font-semibold text-slate-900">Age:</span> {application.age}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Experience:</span> {application.experienceYears} years
          </p>
          <p>
            <span className="font-semibold text-slate-900">Max students / week:</span> {application.maxStudentsPerWeek}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Heard from:</span> {application.heardFromLabel}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Timezone:</span> {application.timezone}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Submitted:</span>{" "}
            {application.createdAt.toLocaleString("en-MY")}
          </p>
        </div>
      </div>

      {application.certificationPath ? (
        <section>
          <h3 className="text-sm font-semibold text-slate-900">Certification file</h3>
          <a
            href={application.certificationPath}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex text-sm font-semibold text-[#0d4f4f] hover:underline"
          >
            View uploaded ijazah / certificate →
          </a>
        </section>
      ) : null}

      <section>
        <h3 className="text-sm font-semibold text-slate-900">Qualifications</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{application.qualifications}</p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900">About</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{application.about}</p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900">Student levels</h3>
        <p className="mt-2 text-sm text-slate-700">{application.studentLevelLabels.join(" · ")}</p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900">Subjects</h3>
        <p className="mt-2 text-sm text-slate-700">{application.teachingSubjectLabels.join(" · ")}</p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900">Languages</h3>
        <p className="mt-2 text-sm text-slate-700">{application.languageLabels.join(" · ")}</p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900">Proposed availability</h3>
        <p className="mt-2 text-sm text-slate-700">{application.availabilitySummary}</p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900">Confirmations</h3>
        <ul className="mt-2 list-inside list-disc text-sm text-slate-700">
          <li>Accurate information: {application.confirmedAccurate ? "Yes" : "No"}</li>
          <li>Code of conduct: {application.confirmedCodeOfConduct ? "Yes" : "No"}</li>
          <li>Background check consent: {application.consentBackgroundCheck ? "Yes" : "No"}</li>
        </ul>
      </section>

      {application.rejectionReason ? (
        <section>
          <h3 className="text-sm font-semibold text-slate-900">Rejection note</h3>
          <p className="mt-2 text-sm text-slate-700">{application.rejectionReason}</p>
        </section>
      ) : null}

      {isPending ? (
        <div className="grid gap-8 border-t border-slate-200 pt-8 lg:grid-cols-2">
          <form action={approveAction} className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
            <h3 className="font-semibold text-slate-900">Approve & create account</h3>
            <p className="text-sm text-slate-600">
              Sets an active teacher login, copies profile fields, and creates weekly availability slots.
            </p>
            {approveState.error && !approveState.ok ? (
              <p className="text-sm text-red-800">{approveState.error}</p>
            ) : null}
            <input type="hidden" name="applicationId" value={application.id} />
            <label className="block text-sm font-medium text-slate-800">
              Initial password (share with teacher)
              <input
                name="password"
                type="text"
                required
                minLength={8}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Min. 8 characters"
              />
            </label>
            <button
              type="submit"
              disabled={approvePending}
              className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {approvePending ? "Creating…" : "Approve application"}
            </button>
          </form>

          <form action={rejectAction} className="space-y-4 rounded-2xl border border-red-200 bg-red-50/40 p-6">
            <h3 className="font-semibold text-slate-900">Reject</h3>
            {rejectState.error && !rejectState.ok ? (
              <p className="text-sm text-red-800">{rejectState.error}</p>
            ) : null}
            <input type="hidden" name="applicationId" value={application.id} />
            <label className="block text-sm font-medium text-slate-800">
              Reason (optional, internal)
              <textarea
                name="rejectionReason"
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={rejectPending}
              className="rounded-full border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-800 hover:bg-red-50 disabled:opacity-60"
            >
              {rejectPending ? "Saving…" : "Reject application"}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
