import { prisma } from "@/server/db";
import { auth } from "@/auth";

/**
 * Record an admin/system action in the audit log. Best-effort: never throws
 * into the caller (a logging failure must not break the underlying action).
 */
export async function logAudit(
  action: string,
  entity: string,
  entityId?: string,
  meta?: Record<string, unknown>,
) {
  try {
    const session = await auth();
    await prisma.auditLog.create({
      data: {
        userId: session?.user?.id ?? null,
        action,
        entity,
        entityId: entityId ?? null,
        meta: meta ? (meta as object) : undefined,
      },
    });
  } catch (e) {
    console.error("[audit] failed", e);
  }
}
