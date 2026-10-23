import type { Metadata } from "next";
import "./globals.css";
import { StoreHeader } from "@/components/store-header";
import { StoreFooter } from "@/components/store-footer";
export const metadata: Metadata = { title: { default: "Banana Crunch | Naturally Crunchy. Simply Delicious.", template: "%s | Banana Crunch" }, description: "Small-batch banana chips with a big, golden crunch. Discover our classic, masala and peri peri favourites." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><StoreHeader />{children}<StoreFooter /></body></html>; }
