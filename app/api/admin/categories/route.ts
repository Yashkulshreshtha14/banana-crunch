import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin,unauthorized } from "@/lib/security";
export async function GET(){if(!await requireAdmin())return unauthorized();return NextResponse.json({categories:await prisma.category.findMany({orderBy:{name:"asc"}})});}
