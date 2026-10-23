import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(){const [cod,shipping]=await Promise.all([prisma.storeSetting.findUnique({where:{key:"cod"}}),prisma.storeSetting.findUnique({where:{key:"shipping"}})]);return NextResponse.json({codEnabled:process.env.COD_ENABLED==="true"||(cod?.value as {enabled?:boolean}|null)?.enabled===true,shipping:shipping?.value||{freeAbove:799,flatRate:49}});}
