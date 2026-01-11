"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Activity, History, CreditCard, Headphones } from "lucide-react";
import { AuthButton } from "@/components/auth/AuthButton";

export function Navbar() {
    const pathname = usePathname();

    const links = [
        { href: "/dashboard", label: "Dashboard", icon: Activity },
        { href: "/history", label: "History", icon: History },
        { href: "/pricing", label: "Pricing", icon: CreditCard },
        { href: "/support", label: "Support", icon: Headphones },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex gap-2 items-center">
                    <Link href="/" className="flex items-center space-x-2 font-bold text-xl bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                        <span>FB ROI Checker</span>
                    </Link>
                </div>

                <div className="flex gap-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "relative flex items-center px-4 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-secondary rounded-md -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <Icon className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">{link.label}</span>
                            </Link>
                        );
                    })}
                    <div className="ml-2 pl-2 border-l border-border">
                        <AuthButton />
                    </div>
                </div>
            </div>
        </nav>
    );
}
