import { SignJWT, jwtVerify } from "jose";
import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
const secret = () => { const value=process.env.SESSION_SECRET; if(process.env.NODE_ENV==="production"&&(!value||value.length<32))throw new Error("SESSION_SECRET must be at least 32 characters in production."); return new TextEncoder().encode(value||"unsafe-development-secret-change-this-now"); };
export async function createSession(user: { id: string; role: string }) {
  const token = await new SignJWT({ role: user.role }).setProtectedHeader({ alg: "HS256" }).setSubject(user.id).setIssuedAt().setExpirationTime("8h").sign(secret());
  (await cookies()).set("bc_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
}
export async function getSession() {
  const token = (await cookies()).get("bc_session")?.value;
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, secret()); return { id: String(payload.sub), role: String(payload.role) }; } catch { return null; }
}
export async function requireAdmin() {
  const session = await getSession();
  if (!session || !["OWNER", "ADMIN", "ORDER_MANAGER"].includes(session.role)) return null;
  return session;
}
export const unauthorized = () => NextResponse.json({ error: "Authentication required" }, { status: 401 });
export function sameOrigin(req:Request) { const origin=req.headers.get("origin"); if(!origin)return true; try { return new URL(origin).host===req.headers.get("host"); } catch { return false; } }
export async function writeAudit(actorId: string, action: string, entity: string, entityId?: string, metadata?: object) {
  await prisma.auditLog.create({ data: { actorId, action, entity, entityId, metadata: metadata as never } });
}
export function safeEqualHex(expected: string, received: string) {
  const a = Buffer.from(expected, "hex"), b = Buffer.from(received, "hex");
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}
