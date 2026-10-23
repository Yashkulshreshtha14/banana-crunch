import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { stdin as input,stdout as output } from "node:process";
const prisma=new PrismaClient();const rl=createInterface({input,output});
try{const count=await prisma.user.count({where:{role:{in:["OWNER","ADMIN"]}}});if(count)throw new Error("An admin account already exists. Use the protected admin panel to manage team access.");const name=await rl.question("Owner name: ");const email=(await rl.question("Owner email: ")).trim().toLowerCase();const password=await rl.question("Password (12+ characters): ");if(password.length<12)throw new Error("Password must be at least 12 characters.");await prisma.user.create({data:{name,email,passwordHash:await hash(password,12),role:"OWNER"}});console.log("Owner account created. Sign in at /admin.");}catch(e){console.error(e instanceof Error?e.message:e);process.exitCode=1;}finally{rl.close();await prisma.$disconnect();}
