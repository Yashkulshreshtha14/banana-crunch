import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin,unauthorized } from "@/lib/security";
export async function GET(){const actor=await requireAdmin();if(!actor)return unauthorized();const since=new Date();since.setDate(1);const [orders,revenue,lowStock,products,customers]=await Promise.all([prisma.order.count({where:{createdAt:{gte:since}}}),prisma.payment.aggregate({where:{status:"PAID",paidAt:{gte:since}},_sum:{amount:true}}),prisma.product.findMany({where:{published:true,stock:{lte:10}},select:{id:true,name:true,sku:true,stock:true},orderBy:{stock:"asc"},take:8}),prisma.product.count(),prisma.user.count({where:{role:"CUSTOMER"}})]);return NextResponse.json({orders,revenue:revenue._sum.amount||0,lowStock,products,customers});}
