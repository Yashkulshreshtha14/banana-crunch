import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sameOrigin } from "@/lib/security";

const ownerRoles = { in: ["OWNER", "ADMIN"] } as const;

export async function POST(req: NextRequest) {
  const setupToken = process.env.ADMIN_SETUP_TOKEN;
  if (!setupToken || setupToken.length < 32) {
    return NextResponse.json({ error: "One-time setup token is not configured." }, { status: 503 });
  }
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const parsed = z.object({
    token: z.string(),
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(12).max(128),
  }).safeParse(await req.json().catch(() => null));

  if (!parsed.success || parsed.data.token !== setupToken) {
    return NextResponse.json({ error: "Setup is unavailable." }, { status: 403 });
  }
  if (!rateLimit(`admin-setup:${req.headers.get("x-forwarded-for") || "unknown"}`, 5)) {
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  }

  const email = parsed.data.email.toLowerCase();
  const passwordHash = await hash(parsed.data.password, 12);

  try {
    const user = await prisma.$transaction(async (tx) => {
      if (await tx.user.count({ where: { role: ownerRoles } })) {
        throw new Error("ADMIN_ALREADY_EXISTS");
      }

      const existing = await tx.user.findUnique({ where: { email } });
      const account = existing
        ? await tx.user.update({
            where: { id: existing.id },
            data: { name: parsed.data.name, passwordHash, role: "OWNER" },
          })
        : await tx.user.create({
            data: { name: parsed.data.name, email, passwordHash, role: "OWNER" },
          });

      await tx.auditLog.create({
        data: {
          actorId: account.id,
          action: "INITIAL_OWNER_CREATED",
          entity: "User",
          entityId: account.id,
        },
      });
      return account;
    }, { isolationLevel: "Serializable" });

    return NextResponse.json({ created: true, userId: user.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "ADMIN_ALREADY_EXISTS") {
      return NextResponse.json({ error: "An administrator already exists." }, { status: 409 });
    }
    const code = typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";
    if (code === "P2002" || code === "P2034") {
      return NextResponse.json({ error: "Setup was used already. Please sign in or contact the store owner." }, { status: 409 });
    }
    console.error("Initial admin setup failed", error);
    return NextResponse.json({ error: "Could not finish setup. Please try again." }, { status: 500 });
  }
}
