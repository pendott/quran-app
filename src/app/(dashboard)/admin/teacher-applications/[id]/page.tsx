import Link from "next/link";
import { notFound } from "next/navigation";
import { DbBanner } from "@/components/dashboard/db-banner";
import { SectionCard } from "@/components/dashboard/section-card";
import { TeacherApplicationReview } from "@/components/admin/teacher-application-review";
import { getAdminTeacherApplicationDetail } from "@/server/queries/teacher-applications";

export default async function AdminTeacherApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { application, dbError } = await getAdminTeacherApplicationDetail(id);

  if (dbError) {
    return <DbBanner message="Database unavailable." />;
  }
  if (!application) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/teacher-applications"
        className="inline-flex text-sm font-semibold text-[#0d4f4f] hover:underline"
      >
        ← Back to applications
      </Link>

      <SectionCard title={application.name} description="Teacher application review">
        <TeacherApplicationReview
          application={{
            id: application.id,
            status: application.status,
            name: application.name,
            legalName: application.legalName,
            idDocumentTypeLabel: application.idDocumentTypeLabel,
            idDocumentNumber: application.idDocumentNumber,
            email: application.email,
            phone: application.phone,
            age: application.age,
            qualifications: application.qualifications,
            experienceYears: application.experienceYears,
            maxStudentsPerWeek: application.maxStudentsPerWeek,
            about: application.about,
            photoPath: application.photoPath,
            certificationPath: application.certificationPath,
            timezone: application.timezone,
            teachingSubjectLabels: application.teachingSubjectLabels,
            studentLevelLabels: application.studentLevelLabels,
            languageLabels: application.languageLabels,
            heardFromLabel: application.heardFromLabel,
            availabilitySummary: application.availabilitySummary,
            confirmedAccurate: application.confirmedAccurate,
            confirmedCodeOfConduct: application.confirmedCodeOfConduct,
            consentBackgroundCheck: application.consentBackgroundCheck,
            createdAt: application.createdAt,
            rejectionReason: application.rejectionReason,
            createdTeacherId: application.createdTeacherId,
          }}
        />
      </SectionCard>
    </div>
  );
}
