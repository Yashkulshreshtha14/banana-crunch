"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, ShoppingBag, X } from "lucide-react";
export function StoreHeader() {
  const [count, setCount] = useState(0), [open, setOpen] = useState(false);
  useEffect(() => { const update = () => { try { setCount(JSON.parse(localStorage.getItem("bc-cart") || "[]").reduce((s: number, x: { quantity: number }) => s + x.quantity, 0)); } catch { setCount(0); } }; update(); window.addEventListener("storage", update); window.addEventListener("cart-change", update); return () => { window.removeEventListener("storage", update); window.removeEventListener("cart-change", update); }; }, []);
  return <><div className="announcement">A little extra crunch, on us · Free shipping over ₹799 <ArrowRight size={13} /></div><header className="site-header"><Link href="/" className="brand"><span className="brand-mark">bc<span>.</span></span><span className="brand-name">banana crunch<small>NATURALLY CRUNCHY. SIMPLY DELICIOUS.</small></span></Link><nav className={open ? "nav-links open" : "nav-links"}><Link href="/shop" onClick={() => setOpen(false)}>Shop all</Link><a href="/#story" onClick={() => setOpen(false)}>Our story</a><a href="/#reviews" onClick={() => setOpen(false)}>Kind words</a><Link href="/track" onClick={() => setOpen(false)}>Track order</Link></nav><div className="header-actions"><Link className="icon-link account-link" href="/account">Account</Link><Link className="bag-link" href="/cart"><ShoppingBag size={19}/><span>Bag</span><b>{count}</b></Link><button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X/> : <Menu/>}</button></div></header></>;
}
