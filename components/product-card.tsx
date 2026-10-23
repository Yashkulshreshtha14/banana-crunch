"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { StoreProduct, inr } from "@/lib/catalog";
export function ProductCard({ product }: { product: StoreProduct }) {
  function add() { const cart = JSON.parse(localStorage.getItem("bc-cart") || "[]") as { id: string; quantity: number }[]; const found = cart.find(x => x.id === product.id); if (found) found.quantity += 1; else cart.push({ id: product.id, quantity: 1 }); localStorage.setItem("bc-cart", JSON.stringify(cart)); window.dispatchEvent(new Event("cart-change")); }
  return <article className="product-card"><div className="product-image"><Link href={`/product/${product.slug}`}><img src={product.image} alt={product.name} loading="lazy"/></Link>{product.badge && <span className="pill">{product.badge}</span>}<button className="quick-add" onClick={add} aria-label={`Add ${product.name} to bag`}><Plus size={17}/></button></div><div className="product-info"><span className="product-category">{product.category}</span><h3><Link href={`/product/${product.slug}`}>{product.name}</Link></h3><div style={{marginTop:8}}><span className="product-price">{inr(product.price)}</span>{product.mrp>product.price&&<s className="product-size">{inr(product.mrp)}</s>}<span className="product-size">{product.packSize}</span></div></div></article>;
}
