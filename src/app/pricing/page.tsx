"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Check, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PricingPage() {
    const [isPro, setIsPro] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkSubscription() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                // Check subscription status from users table using ID (matches RLS)
                // Use maybeSingle() to handle case where user doesn't exist yet
                const { data: userData } = await supabase
                    .from('users')
                    .select('subscription_status')
                    .eq('id', user.id)
                    .maybeSingle();

                // Check from table or auth metadata
                if (userData?.subscription_status === 'pro' || user.user_metadata?.is_pro) {
                    setIsPro(true);
                }
            }
            setLoading(false);
        }
        checkSubscription();
    }, []);

    const handleUpgrade = async () => {
        try {
            const res = await fetch("/api/checkout", { method: "POST" });
            const data = await res.json();
            if (data.url) {
                console.log("Redirecting to Dodo URL:", data.url);
                window.location.href = data.url;
            } else if (data.error === "Unauthorized") {
                console.log("Unauthorized, redirecting to login");
                window.location.href = "/login?next=/pricing";
            } else {
                alert(data.error || "Something went wrong. Please try again.");
            }
        } catch (e) {
            console.error(e);
            alert("Error connecting to checkout.");
        }
    };

    const plans = [
        {
            name: "Starter",
            price: "$0",
            description: "For casual advertisers",
            features: [
                "3 Calculations per month",
                "Basic ROI metrics",
                "Ad Spend Analysis",
                "Community Support",
            ],
            cta: isPro ? "Free Plan" : "Current Plan",
            disabled: true,
        },
        {
            name: "Pro",
            price: "₹1",
            period: "/month",
            description: "For scaling brands",
            features: [
                "Unlimited Calculations",
                "Export to CSV",
                "Advanced Benchmark Data",
                "Priority Support",
                "Save Unlimited History",
            ],
            cta: isPro ? "Current Plan ✓" : "Upgrade to Pro",
            highlight: true,
            action: isPro ? undefined : handleUpgrade,
            disabled: isPro,
        },
    ];

    return (
        <div className="py-10 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
                Simple, Transparent Pricing
            </h1>
            <p className="text-muted-foreground mb-8">
                Stop guessing. Start scaling with confidence.
            </p>

            {isPro && (
                <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/50 rounded-full">
                    <Crown className="h-5 w-5 text-amber-500" />
                    <span className="font-semibold text-amber-400">You&apos;re a Pro member!</span>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
                {plans.map((plan) => (
                    <GlassCard
                        key={plan.name}
                        className={`text-left relative ${plan.highlight ? "border-primary/50 shadow-primary/20" : ""
                            } ${plan.name === "Pro" && isPro ? "ring-2 ring-amber-500" : ""}`}
                    >
                        {plan.highlight && !isPro && (
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
                                POPULAR
                            </div>
                        )}
                        {plan.name === "Pro" && isPro && (
                            <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg flex items-center gap-1">
                                <Crown className="h-3 w-3" />
                                ACTIVE
                            </div>
                        )}
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        <div className="mt-2 mb-4">
                            <span className="text-4xl font-bold">{plan.price}</span>
                            {plan.period && (
                                <span className="text-muted-foreground">{plan.period}</span>
                            )}
                        </div>
                        <p className="text-muted-foreground mb-6">{plan.description}</p>
                        <ul className="space-y-3 mb-8">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Button
                            className={`w-full ${plan.name === "Pro" && isPro ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black" : ""}`}
                            variant={plan.highlight && !isPro ? "primary" : "outline"}
                            onClick={plan.action}
                            disabled={plan.disabled || loading}
                        >
                            {plan.cta}
                        </Button>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}
