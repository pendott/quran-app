import { Prisma } from "@prisma/client";

export function isDatabaseUnavailable(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return ["P1001", "P1000"].includes(error.code);
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  return false;
}

/** Table/column missing — run `prisma migrate deploy` on the server. */
export function isSchemaOutOfDate(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return ["P2021", "P2022"].includes(error.code);
  }
  return false;
}

export function isPrismaQueryError(error: unknown): boolean {
  return (
    isDatabaseUnavailable(error) ||
    isSchemaOutOfDate(error) ||
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientValidationError
  );
}
