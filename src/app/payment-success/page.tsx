"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Crown, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const [done, setDone] = useState(false);

    const success = searchParams.get("success");

    useEffect(() => {
        if (success !== "true") {
            window.location.href = "/pricing";
            return;
        }

        // Simple timeout to simulate processing, then call API
        const timer = setTimeout(async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                
                if (user) {
                    const renewalDate = new Date();
                    renewalDate.setDate(renewalDate.getDate() + 30);

                    await fetch("/api/upgrade-pro", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userId: user.id,
                            renewalDate: renewalDate.toISOString()
                        })
                    });
                }
            } catch (e) {
                console.error("Upgrade error:", e);
            }
            setDone(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, [success]);

    if (!done) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg text-muted-foreground">Processing your upgrade...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <GlassCard className="p-8 text-center max-w-md">
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <Crown className="h-16 w-16 text-amber-500" />
                        <CheckCircle className="h-6 w-6 text-green-500 absolute -bottom-1 -right-1" />
                    </div>
                </div>
                
                <h1 className="text-2xl font-bold mb-2">Welcome to Pro! 🎉</h1>
                <p className="text-muted-foreground mb-6">
                    Your account has been upgraded. Enjoy unlimited calculations!
                </p>

                <div className="space-y-3">
                    <Link href="/dashboard" className="block">
                        <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black">
                            Start Calculating
                        </Button>
                    </Link>
                    <Link href="/history" className="block">
                        <Button variant="outline" className="w-full">
                            View History
                        </Button>
                    </Link>
                </div>
            </GlassCard>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <PaymentSuccessContent />
        </Suspense>
    );
}
