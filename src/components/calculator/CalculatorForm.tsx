"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { calculatorSchema, CalculatorInputs } from "@/schemas/calculator";
import { useCalculatorStore, FREE_CALCULATION_LIMIT, PRO_CALCULATION_LIMIT } from "@/store/useCalculatorStore";
import { Input } from "@/components/ui/Input";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Save, Crown, Zap, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function CalculatorForm() {
    const { 
        spend, clicks, sales, customers, repeatRate, 
        setSpend, setClicks, setSales, setCustomers, setRepeatRate, 
        saveToHistory, calculate, fetchHistory,
        canCalculate, incrementCalculations, getRemainingCalculations, isPro, checkAndResetMonthly
    } = useCalculatorStore();
    
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [remaining, setRemaining] = useState(FREE_CALCULATION_LIMIT);

    const form = useForm<CalculatorInputs>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(calculatorSchema) as any,
        defaultValues: {
            spend: Number(spend) || undefined,
            clicks: Number(clicks) || undefined,
            sales: Number(sales) || undefined,
            customers: Number(customers) || undefined,
            repeatRate: Number(repeatRate) || undefined,
        },
        mode: "onChange",
    });

    const { watch, formState: { errors } } = form;
    const values = watch();

    const { spend: formSpend, clicks: formClicks, sales: formSales, customers: formCustomers, repeatRate: formRepeatRate } = values;

    useEffect(() => {
        if (formSpend !== undefined && Number(formSpend) !== Number(spend)) setSpend(formSpend);
        if (formClicks !== undefined && Number(formClicks) !== Number(clicks)) setClicks(formClicks);
        if (formSales !== undefined && Number(formSales) !== Number(sales)) setSales(formSales);
        if (formCustomers !== undefined && Number(formCustomers) !== Number(customers)) setCustomers(formCustomers);
        if (formRepeatRate !== undefined && Number(formRepeatRate) !== Number(repeatRate)) setRepeatRate(formRepeatRate);
    }, [
        formSpend, formClicks, formSales, formCustomers, formRepeatRate,
        setSpend, setClicks, setSales, setCustomers, setRepeatRate,
        spend, clicks, sales, customers, repeatRate
    ]);

    // Check and reset monthly, update remaining count
    useEffect(() => {
        checkAndResetMonthly();
        setRemaining(getRemainingCalculations());
    }, [checkAndResetMonthly, getRemainingCalculations]);

    // Fetch cloud history on mount
    useEffect(() => {
        let isMounted = true;
        
        const loadHistory = async () => {
            try {
                await fetchHistory();
            } catch (error) {
                // Silently ignore AbortError and auth errors on mount
                if (error instanceof Error && error.name === 'AbortError') {
                    return;
                }
                if (isMounted) {
                    console.error('Failed to load history:', error);
                }
            }
        };

        loadHistory();
        
        return () => {
            isMounted = false;
        };
    }, [fetchHistory]);

    const onSave = () => {
        // Check if user can calculate
        if (!canCalculate()) {
            setShowUpgradeModal(true);
            return;
        }

        const result = calculate();
        if (result) {
            incrementCalculations();
            setRemaining(getRemainingCalculations() - 1);
            saveToHistory(result);
            toast.success("Calculation saved to history!");
        } else {
            toast.error("Please fill in valid numbers first.");
        }
    };

    const limit = isPro ? PRO_CALCULATION_LIMIT : FREE_CALCULATION_LIMIT;
    const used = limit - remaining;

    return (
        <>
            <GlassCard className="h-full">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            Input Metrics
                        </h2>
                        <div className={`text-xs flex items-center gap-1 ${remaining === 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                            <Zap className="h-3 w-3" />
                            <span>Used {used}/{limit}</span>
                        </div>
                    </div>

                    <form className="space-y-4">
                        <Input
                            label="Total Ad Spend ($)"
                            type="number"
                            placeholder="e.g. 1000"
                            error={errors.spend?.message}
                            {...form.register("spend")}
                        />

                        <Input
                            label="Total Clicks"
                            type="number"
                            placeholder="e.g. 800"
                            error={errors.clicks?.message}
                            {...form.register("clicks")}
                        />

                        <Input
                            label="Total Sales ($)"
                            type="number"
                            placeholder="e.g. 4000"
                            error={errors.sales?.message}
                            {...form.register("sales")}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Customers"
                                type="number"
                                placeholder="e.g. 50"
                                error={errors.customers?.message}
                                {...form.register("customers")}
                            />

                            <Input
                                label="Repeat Rate (Multiplier)"
                                type="number"
                                step="0.01"
                                placeholder="e.g. 1.2 or 0.3"
                                error={errors.repeatRate?.message}
                                {...form.register("repeatRate")}
                            />
                        </div>

                        <Button type="button" onClick={onSave} className="w-full mt-4 group">
                            <Save className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                            Save Calculation
                        </Button>
                    </form>
                </div>
            </GlassCard>

            {/* Upgrade Modal */}
            <AnimatePresence>
                {showUpgradeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowUpgradeModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Crown className="h-8 w-8 text-black" />
                                </div>
                                
                                <h3 className="text-2xl font-bold mb-2">Calculation Limit Reached!</h3>
                                <p className="text-muted-foreground mb-6">
                                    You&apos;ve used all {FREE_CALCULATION_LIMIT} free calculations this month. 
                                    Upgrade to Pro for {PRO_CALCULATION_LIMIT} calculations per month!
                                </p>

                                <div className="space-y-3">
                                    <Link href="/pricing" className="block">
                                        <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:from-amber-600 hover:to-yellow-600">
                                            <Crown className="mr-2 h-4 w-4" />
                                            Upgrade to Pro - $9/mo
                                        </Button>
                                    </Link>
                                    <Button 
                                        variant="ghost" 
                                        className="w-full"
                                        onClick={() => setShowUpgradeModal(false)}
                                    >
                                        Maybe Later
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
