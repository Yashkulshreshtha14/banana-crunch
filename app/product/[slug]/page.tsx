"use client";
import { useEffect,useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { catalog,inr } from "@/lib/catalog";
import type { StoreProduct } from "@/lib/catalog";
import { toStoreProduct } from "@/lib/store-products";
import { ArrowLeft,Plus,Minus,ShieldCheck } from "lucide-react";
export default function ProductPage(){
  const{slug}=useParams<{slug:string}>();const[product,setProduct]=useState<StoreProduct|undefined>(catalog.find(x=>x.slug===slug));const[qty,setQty]=useState(1);
  useEffect(()=>{fetch(`/api/products/${encodeURIComponent(slug)}`).then(r=>r.json()).then(d=>{if(d.product)setProduct(toStoreProduct(d.product));}).catch(()=>{});},[slug]);
  if(!product)return <div className="not-found"><h1>That flavour went missing.</h1><Link className="button" href="/shop">Back to the shop</Link></div>;
  const p=product;
  function add(){const cart=JSON.parse(localStorage.getItem("bc-cart")||"[]") as {id:string;quantity:number}[];const row=cart.find(x=>x.id===p.id);if(row)row.quantity+=qty;else cart.push({id:p.id,quantity:qty});localStorage.setItem("bc-cart",JSON.stringify(cart));window.dispatchEvent(new Event("cart-change"));location.href="/cart";}
  return <main className="page-shell"><Link href="/shop" className="text-link"><ArrowLeft size={14}/> All snacks</Link><div className="checkout-grid" style={{marginTop:28,gridTemplateColumns:"1.1fr .9fr"}}><div className="product-image" style={{height:460}}><img src={p.image} alt={p.name}/></div><div><span className="eyebrow">{p.category} · {p.packSize}</span><h1 style={{marginTop:14}}>{p.name}</h1><p className="product-category">A lovely snack-break favourite</p><p>{p.description}</p><div style={{fontSize:22,fontWeight:700,margin:"22px 0"}}>{inr(p.price)} {p.mrp>p.price&&<s style={{fontSize:13,color:"#999",fontWeight:400}}>{inr(p.mrp)}</s>}</div><p className="helper">Inclusive of all taxes · Freshness details on the pack</p><div className="qty-control" style={{margin:"25px 0"}}><button aria-label="Decrease quantity" onClick={()=>setQty(Math.max(1,qty-1))}><Minus size={12}/></button><b>{qty}</b><button aria-label="Increase quantity" onClick={()=>setQty(qty+1)}><Plus size={12}/></button></div><button className="button" style={{width:"100%"}} onClick={add}>Add to bag · {inr(p.price*qty)}</button><p className="helper" style={{marginTop:14}}><ShieldCheck size={14} style={{verticalAlign:"middle"}}/> Secure checkout · Delivery checked at checkout</p><div className="faq-item"><h3>Ingredients & details</h3><p>{p.description} Please check the pack for verified ingredients, nutrition and allergen information.</p></div></div></div></main>;
}
