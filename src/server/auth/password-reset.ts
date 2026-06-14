import { UserRole, UserStatus } from "@prisma/client";
import { createHash, randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { addHours } from "date-fns";
import { prisma } from "@/lib/db";
import { getPublicAppUrl } from "@/lib/app-url";
import { sendPasswordResetEmail } from "@/server/auth/password-reset-emails";

const RESET_PREFIX = "reset:";
const RESET_TTL_HOURS = 1;

export const PASSWORD_RESET_ROLES: UserRole[] = [UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT];

function resetIdentifier(email: string) {
  return `${RESET_PREFIX}${email.toLowerCase()}`;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(emailRaw: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = emailRaw.trim().toLowerCase();
  if (!email.includes("@")) {
    return { ok: false, error: "Enter a valid email address" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (
    user &&
    user.status === UserStatus.ACTIVE &&
    PASSWORD_RESET_ROLES.includes(user.role) &&
    user.passwordHash
  ) {
    const token = randomBytes(32).toString("hex");
    const identifier = resetIdentifier(email);

    await prisma.verificationToken.deleteMany({ where: { identifier } });
    await prisma.verificationToken.create({
      data: {
        identifier,
        token: hashToken(token),
        expires: addHours(new Date(), RESET_TTL_HOURS),
      },
    });

    void sendPasswordResetEmail({
      to: email,
      name: user.name ?? email,
      resetUrl: `${getPublicAppUrl()}/reset-password/${token}`,
    });
  }

  return { ok: true };
}

export async function getPasswordResetEmailForToken(token: string) {
  const row = await prisma.verificationToken.findUnique({
    where: { token: hashToken(token) },
  });
  if (!row?.identifier.startsWith(RESET_PREFIX)) {
    return null;
  }
  if (row.expires <= new Date()) {
    return null;
  }
  return row.identifier.slice(RESET_PREFIX.length);
}

export async function resetPasswordWithToken(
  token: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }

  const email = await getPasswordResetEmailForToken(token);
  if (!email) {
    return { ok: false, error: "This reset link is invalid or has expired. Request a new one." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !PASSWORD_RESET_ROLES.includes(user.role) || user.status !== UserStatus.ACTIVE) {
    return { ok: false, error: "This reset link is invalid or has expired. Request a new one." };
  }

  const passwordHash = await hash(password, 12);
  const identifier = resetIdentifier(email);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    }),
    prisma.verificationToken.deleteMany({ where: { identifier } }),
  ]);

  return { ok: true };
}
