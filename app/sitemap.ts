import type { MetadataRoute } from "next";
import { catalog } from "@/lib/catalog";
export default function sitemap():MetadataRoute.Sitemap{const base=process.env.APP_URL||"http://localhost:3000";return ["","/shop","/about","/contact","/faqs","/shipping-policy","/returns","/privacy","/terms",...catalog.map(p=>`/product/${p.slug}`)].map(path=>({url:`${base}${path}`,lastModified:new Date(),changeFrequency:path===""?"weekly":"monthly",priority:path===""?1:.6}));}
