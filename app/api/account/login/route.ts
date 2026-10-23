import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";
export async function POST(req:NextRequest){if(!rateLimit(`customer-login:${req.headers.get("x-forwarded-for")||"unknown"}`,6))return NextResponse.json({error:"Too many attempts. Try again shortly."},{status:429});const parsed=z.object({email:z.string().email(),password:z.string().min(1).max(128)}).safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Check your email and password."},{status:400});const user=await prisma.user.findUnique({where:{email:parsed.data.email.toLowerCase()}});if(!user||user.role!=="CUSTOMER"||!user.passwordHash||!await compare(parsed.data.password,user.passwordHash))return NextResponse.json({error:"The email or password is incorrect."},{status:401});await createSession(user);return NextResponse.json({ok:true});}
