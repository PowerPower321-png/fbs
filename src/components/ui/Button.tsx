"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import React from "react";

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "destructive" | "ghost" | "outline";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
    children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {

        const variants = {
            primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        };

        const sizes = {
            sm: "h-9 px-3 text-xs rounded-md",
            md: "h-11 px-8 py-2 rounded-lg",
            lg: "h-12 px-8 rounded-lg text-lg",
            icon: "h-10 w-10",
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </motion.button>
        );
    }
);
Button.displayName = "Button";
