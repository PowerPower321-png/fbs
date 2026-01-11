"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { LogOut, Crown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AuthButton() {
    const [user, setUser] = useState<User | null>(null);
    const [isPro, setIsPro] = useState(false);
    const [supabase] = useState(() => createClient());
    const [showProMessage, setShowProMessage] = useState(false);

    useEffect(() => {
        // Get initial session and subscription status
        async function fetchUserAndSubscription() {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Check subscription status from users table using ID
                const { data: userData } = await supabase
                    .from('users')
                    .select('subscription_status')
                    .eq('id', user.id)
                    .maybeSingle();

                const isProFromTable = userData?.subscription_status === 'pro';
                const isProFromMeta = user.user_metadata?.is_pro === true;
                setIsPro(isProFromTable || isProFromMeta);
            }
        }

        fetchUserAndSubscription();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            
            if (session?.user) {
                const { data: userData } = await supabase
                    .from('users')
                    .select('subscription_status')
                    .eq('id', session.user.id)
                    .maybeSingle();

                const isProFromTable = userData?.subscription_status === 'pro';
                const isProFromMeta = session.user.user_metadata?.is_pro === true;
                setIsPro(isProFromTable || isProFromMeta);
            } else {
                setIsPro(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleLogout = async () => {
        console.log('Starting logout process...');
        
        // Clear local state immediately
        setUser(null);
        setIsPro(false);
        
        // Clear all local storage
        try {
            localStorage.clear();
            sessionStorage.clear();
            
            // Clear all cookies
            document.cookie.split(";").forEach(cookie => {
                const name = cookie.split("=")[0].trim();
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
            });
            
            console.log('Local storage and cookies cleared');
        } catch (e) {
            console.error('Error clearing storage:', e);
        }
        
        // Try Supabase signout (don't wait for it)
        supabase.auth.signOut({ scope: 'global' }).then(() => {
            console.log('Supabase signout complete');
        }).catch((err) => {
            console.error('Supabase signout error:', err);
        });
        
        // Immediately redirect to home
        console.log('Redirecting to home...');
        window.location.replace('/');
    };

    if (!user) {
        return (
            <Link href="/login">
                <Button variant="ghost" size="sm">
                    Sign In
                </Button>
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <AnimatePresence>
                {isPro && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="relative"
                        onMouseEnter={() => setShowProMessage(true)}
                        onMouseLeave={() => setShowProMessage(false)}
                    >
                        <motion.span 
                            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black rounded-full shadow-lg shadow-amber-500/30 cursor-pointer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Crown className="h-3.5 w-3.5" />
                            <span>PRO</span>
                            <Sparkles className="h-3 w-3" />
                        </motion.span>
                        
                        {/* Pro tooltip message */}
                        <AnimatePresence>
                            {showProMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gradient-to-r from-amber-500/90 to-yellow-500/90 text-black text-xs font-medium rounded-lg whitespace-nowrap z-50 shadow-xl"
                                >
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-500 rotate-45" />
                                    ✨ You&apos;re a Pro User!
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <span className="text-sm text-muted-foreground hidden sm:inline-block font-medium">
                {user.email?.split('@')[0]}
            </span>
            
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                    console.log('Sign out button clicked');
                    handleLogout();
                }} 
                title="Sign Out"
                className="text-destructive border-destructive/30 hover:bg-destructive hover:text-white transition-colors gap-1.5"
            >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
            </Button>
        </div>
    );
}

