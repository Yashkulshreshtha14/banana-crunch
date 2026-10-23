import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";
export async function POST(req:NextRequest){if(!rateLimit(`register:${req.headers.get("x-forwarded-for")||"unknown"}`,5))return NextResponse.json({error:"Too many attempts. Try again later."},{status:429});const parsed=z.object({name:z.string().min(2).max(100),email:z.string().email(),phone:z.string().regex(/^[6-9]\d{9}$/),password:z.string().min(12).max(128)}).safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Check the details. Passwords must be at least 12 characters."},{status:400});const email=parsed.data.email.toLowerCase();if(await prisma.user.findUnique({where:{email}}))return NextResponse.json({error:"An account with this email already exists."},{status:409});const user=await prisma.user.create({data:{name:parsed.data.name,email,phone:parsed.data.phone,passwordHash:await hash(parsed.data.password,12),role:"CUSTOMER"}});await createSession(user);return NextResponse.json({ok:true},{status:201});}
