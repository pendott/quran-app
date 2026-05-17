import { notFound } from "next/navigation";
import { UserStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { InviteAcceptForm } from "@/components/auth/invite-accept-form";

type Props = { params: Promise<{ token: string }> };

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const user = await prisma.user.findFirst({
    where: {
      inviteToken: token,
      status: UserStatus.INVITED,
      inviteExpiresAt: { gt: new Date() },
    },
  });
  if (!user) notFound();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
        <h1 className="text-xl font-semibold text-slate-900">Join Quran Class</h1>
        <p className="mt-2 text-sm text-slate-600">
          Set your password for <strong>{user.email}</strong> and add your child&apos;s name.
        </p>
        <div className="mt-6">
          <InviteAcceptForm token={token} defaultName={user.name ?? ""} />
        </div>
      </div>
    </div>
  );
}
