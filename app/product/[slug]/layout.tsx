import type { Metadata } from "next";
import { catalog } from "@/lib/catalog";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const{slug}=await params;const product=catalog.find(p=>p.slug===slug);return{title:product?.name||"Banana chips",description:product?.description||"Discover a fresh, crunchy Banana Crunch snack."};}
export default function ProductLayout({children}:{children:React.ReactNode}){return children;}
