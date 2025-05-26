"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package2, Home, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Package2 className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg">
            {siteConfig.name}
          </span>
        </Link>
        <nav className="flex items-center space-x-2">
          <Button
            variant={pathname === "/" ? "secondary" : "ghost"}
            asChild
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Inquiry Form
            </Link>
          </Button>
          <Button
            variant={pathname.startsWith("/admin") ? "secondary" : "ghost"}
            asChild
          >
            <Link href="/admin">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Admin Dashboard
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
