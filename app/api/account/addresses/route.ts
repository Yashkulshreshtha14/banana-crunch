import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession,sameOrigin } from "@/lib/security";
const schema=z.object({name:z.string().min(2).max(100),phone:z.string().regex(/^[6-9]\d{9}$/),line1:z.string().min(4).max(160),line2:z.string().max(160).optional(),city:z.string().min(2).max(80),state:z.string().min(2).max(80),pincode:z.string().regex(/^\d{6}$/),isDefault:z.boolean().default(false)});
export async function POST(req:NextRequest){const session=await getSession();if(!session||session.role!=="CUSTOMER")return NextResponse.json({error:"Sign in to save an address."},{status:401});if(!sameOrigin(req))return NextResponse.json({error:"Invalid request origin."},{status:403});const parsed=schema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Check your address details."},{status:400});if(parsed.data.isDefault)await prisma.address.updateMany({where:{userId:session.id},data:{isDefault:false}});const address=await prisma.address.create({data:{...parsed.data,userId:session.id}});return NextResponse.json({address},{status:201});}
