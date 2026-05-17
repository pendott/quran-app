import { notFound } from "next/navigation";
import { UserStatus } from "@prisma/client";
import { Logo } from "@/components/brand/logo";
import { InviteAcceptForm } from "@/components/auth/invite-accept-form";
import { prisma } from "@/lib/db";
import { APP_NAME } from "@/lib/brand";

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
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f3] px-4 py-12">
      <div className="w-full max-w-md rounded-[32px] border border-[#0d4f4f]/10 bg-white p-8 shadow-xl">
        <Logo variant="full" href="/" className="mx-auto max-w-[200px]" />
        <h1 className="mt-6 text-center text-xl font-semibold text-[#0d4f4f]">Join {APP_NAME}</h1>
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
