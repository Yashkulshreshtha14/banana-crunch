import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(){try{const products=await prisma.product.findMany({where:{published:true},include:{category:true},orderBy:[{featured:"desc"},{createdAt:"desc"}]});return NextResponse.json({products});}catch{return NextResponse.json({error:"Product catalogue unavailable"},{status:503});}}
