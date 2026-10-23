import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireAdmin,unauthorized,writeAudit,sameOrigin } from "@/lib/security";
export async function GET(){const actor=await requireAdmin();if(!actor)return unauthorized();const values=await prisma.storeSetting.findMany();return NextResponse.json({settings:Object.fromEntries(values.map(x=>[x.key,x.value]))});}
export async function PATCH(req:NextRequest){const actor=await requireAdmin();if(!actor)return unauthorized();if(actor.role!=="OWNER"&&actor.role!=="ADMIN")return NextResponse.json({error:"Insufficient permissions."},{status:403});if(!sameOrigin(req))return NextResponse.json({error:"Invalid request origin."},{status:403});const parsed=z.object({key:z.enum(["shipping","cod","homepage","policies","contact"]),value:z.record(z.string(),z.unknown())}).safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid setting."},{status:400});const value=parsed.data.value as Prisma.InputJsonValue;const setting=await prisma.storeSetting.upsert({where:{key:parsed.data.key},update:{value},create:{key:parsed.data.key,value}});await writeAudit(actor.id,"STORE_SETTING_UPDATED","StoreSetting",setting.key);return NextResponse.json({setting});}
