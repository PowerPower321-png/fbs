"use client";

import { useCalculatorStore } from "@/store/useCalculatorStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Users, DollarSign, Activity, LucideIcon, Sparkles, X, Loader2, Download, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export function ResultsDashboard() {
    const { spend, sales, customers, repeatRate, clicks, isPro } = useCalculatorStore();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const s = Number(spend) || 0;
    const sl = Number(sales) || 0;
    const c = Number(customers) || 0;
    const r = Number(repeatRate) || 0;
    const cl = Number(clicks) || 0;

    const roas = s > 0 ? sl / s : 0;
    const cpa = c > 0 ? s / c : 0;
    const ltv = c > 0 ? (sl / c) * r : 0;
    const conversionRate = cl > 0 ? ((c / cl) * 100).toFixed(2) : "0";
    const benchmark = roas > 3.2 ? "Top 20%" : "Average";

    let roasColor = "text-red-500";
    let roasBg = "bg-red-500/10";
    let status = "KILL IMMEDIATELY";

    if (roas >= 4) {
        roasColor = "text-success";
        roasBg = "bg-success/10";
        status = "SCALE AGGRESSIVELY";
    } else if (roas >= 2.5) {
        roasColor = "text-warning";
        roasBg = "bg-warning/10";
        status = "SCALE CAUTIOUSLY";
    } else if (roas >= 2.0) {
        roasColor = "text-yellow-500";
        roasBg = "bg-yellow-500/10";
        status = "MONITOR CLOSELY";
    }

    const handleAnalyze = async () => {
        if (!s || !sl || !c) {
            setError("Please fill in the calculator with valid data first.");
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setShowAnalysisModal(true);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    spend: s,
                    clicks: cl,
                    sales: sl,
                    customers: c,
                    repeatRate: r,
                    roas,
                    cpa,
                    ltv,
                    conversionRate,
                    benchmark,
                    status,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze');
            }

            setAnalysis(data.analysis);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate analysis');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Simple markdown to HTML renderer
    const renderMarkdown = (text: string) => {
        return text
            .split('\n')
            .map((line, index) => {
                // Headers
                if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-bold mt-6 mb-3 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">{line.slice(3)}</h2>;
                }
                if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
                }
                if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl font-bold mt-6 mb-4">{line.slice(2)}</h1>;
                }
                // Bullet points
                if (line.startsWith('- ') || line.startsWith('* ')) {
                    const content = line.slice(2);
                    // Handle bold text
                    const parts = content.split(/\*\*(.*?)\*\*/g);
                    return (
                        <li key={index} className="ml-4 mb-2 flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>
                                {parts.map((part, i) => 
                                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                                )}
                            </span>
                        </li>
                    );
                }
                // Numbered lists
                const numberedMatch = line.match(/^(\d+)\.\s(.*)$/);
                if (numberedMatch) {
                    const content = numberedMatch[2];
                    const parts = content.split(/\*\*(.*?)\*\*/g);
                    return (
                        <li key={index} className="ml-4 mb-2 flex items-start gap-2">
                            <span className="text-primary font-bold min-w-[20px]">{numberedMatch[1]}.</span>
                            <span>
                                {parts.map((part, i) => 
                                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                                )}
                            </span>
                        </li>
                    );
                }
                // Empty lines
                if (line.trim() === '') {
                    return <div key={index} className="h-2" />;
                }
                // Regular paragraphs with bold handling
                const parts = line.split(/\*\*(.*?)\*\*/g);
                return (
                    <p key={index} className="mb-2 text-muted-foreground leading-relaxed">
                        {parts.map((part, i) => 
                            i % 2 === 1 ? <strong key={i} className="text-foreground">{part}</strong> : part
                        )}
                    </p>
                );
            });
    };

    interface MetricCardProps {
        label: string;
        value: string | number;
        icon: LucideIcon;
        subtext?: string;
        delay?: number;
    }

    const MetricCard = ({ label, value, icon: Icon, subtext, delay }: MetricCardProps) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-2 hover:bg-slate-100 transition-colors shadow-sm"
        >
            <div className={`p-2 rounded-full ${roasBg}`}>
                <Icon className={`w-5 h-5 ${roasColor}`} />
            </div>
            <span className="text-sm text-muted-foreground font-medium">{label}</span>
            <span className="text-2xl font-bold tracking-tight">{value}</span>
            {subtext && <span className="text-xs text-muted-foreground">{subtext}</span>}
        </motion.div>
    );

    return (
        <>
            <GlassCard className="h-full">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Results</h2>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${roasBg} ${roasColor} border border-current`}>
                            {status}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            className={`col-span-2 p-6 rounded-2xl border-2 flex flex-col items-center justify-center space-y-2 ${roas >= 4 ? "border-success bg-success/5" :
                                roas >= 2.5 ? "border-warning bg-warning/5" :
                                    "border-destructive bg-destructive/5"
                                }`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key="roas-main"
                        >
                            <span className="text-sm uppercase tracking-widest font-bold opacity-70">ROAS</span>
                            <span className={`text-5xl font-black ${roasColor}`}>
                                {roas.toFixed(2)}x
                            </span>
                            <span className="text-sm opacity-70">Return On Ad Spend</span>
                        </motion.div>

                        <MetricCard
                            label="CPA"
                            value={formatCurrency(cpa)}
                            icon={Users}
                            subtext="Cost Per Acquisition"
                            delay={0.1}
                        />
                        <MetricCard
                            label="LTV"
                            value={formatCurrency(ltv)}
                            icon={DollarSign}
                            subtext="Lifetime Value"
                            delay={0.2}
                        />
                        <MetricCard
                            label="Conv. Rate"
                            value={cl > 0 ? ((c / cl) * 100).toFixed(2) + "%" : "0%"}
                            icon={Activity}
                            subtext="Click to Customer"
                            delay={0.3}
                        />
                        <MetricCard
                            label="Benchmark"
                            value={roas > 3.2 ? "Top 20%" : "Avg"}
                            icon={TrendingUp}
                            subtext="Vs. Ecom Avg"
                            delay={0.4}
                        />
                    </div>

                    {/* Benchmarks Text */}
                    <div className="bg-secondary/50 p-4 rounded-lg text-sm text-center">
                        {roas > 3.2 ? "🚀 Your 3.2x beats 78% of ecom stores!" : roas < 2 ? "⚠️ Below industry standard (2.0x)." : "📊 You are tracking with industry avg."}
                    </div>

                    {/* Analyze Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !s || !sl || !c}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-3 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 group"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Analyzing with AI...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                    Analyze with AI
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            Get a detailed AI-powered report of your campaign
                        </p>
                    </motion.div>
                </div>
            </GlassCard>

            {/* Analysis Modal */}
            <AnimatePresence>
                {showAnalysisModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                        onClick={() => setShowAnalysisModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-card border border-border rounded-2xl p-6 max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full flex items-center justify-center">
                                        <Sparkles className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">AI Campaign Analysis</h3>
                                        <p className="text-sm text-muted-foreground">Powered by Gemini AI</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAnalysisModal(false)}
                                    className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-secondary rounded-lg"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {isAnalyzing && (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <div className="relative">
                                            <div className="w-16 h-16 border-4 border-violet-200 rounded-full" />
                                            <div className="w-16 h-16 border-4 border-violet-600 rounded-full border-t-transparent animate-spin absolute inset-0" />
                                        </div>
                                        <p className="mt-6 text-lg font-medium">Analyzing your campaign...</p>
                                        <p className="text-sm text-muted-foreground mt-2">This may take a few seconds</p>
                                    </div>
                                )}

                                {error && !isAnalyzing && (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                            <X className="h-8 w-8 text-red-500" />
                                        </div>
                                        <p className="text-lg font-medium text-red-500">Analysis Failed</p>
                                        <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">{error}</p>
                                        <Button
                                            onClick={handleAnalyze}
                                            className="mt-6"
                                            variant="outline"
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                )}

                                {analysis && !isAnalyzing && !error && (
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        {renderMarkdown(analysis)}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {analysis && !isAnalyzing && (
                                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                                    <div>
                                        {isPro ? (
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    // Export analysis to CSV
                                                    const s = Number(spend) || 0;
                                                    const sl = Number(sales) || 0;
                                                    const c = Number(customers) || 0;
                                                    const r = Number(repeatRate) || 0;
                                                    const cl = Number(clicks) || 0;
                                                    const roas = s > 0 ? sl / s : 0;
                                                    const cpa = c > 0 ? s / c : 0;
                                                    const ltv = c > 0 ? (sl / c) * r : 0;
                                                    
                                                    const csvContent = `FB ROI Analysis Report\n\nMetrics Summary\nMetric,Value\nTotal Ad Spend,$${s.toLocaleString()}\nTotal Sales,$${sl.toLocaleString()}\nTotal Clicks,${cl.toLocaleString()}\nCustomers Acquired,${c}\nRepeat Rate,${r}x\n\nKey Performance Indicators\nKPI,Value\nROAS,${roas.toFixed(2)}x\nCPA,$${cpa.toFixed(2)}\nLTV,$${ltv.toFixed(2)}\nConversion Rate,${cl > 0 ? ((c / cl) * 100).toFixed(2) : 0}%\n\nAnalysis Report\n${analysis?.replace(/[#*]/g, '').replace(/\n/g, '\n')}`;
                                                    
                                                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                                    const url = URL.createObjectURL(blob);
                                                    const link = document.createElement('a');
                                                    link.setAttribute('href', url);
                                                    link.setAttribute('download', `fb-roi-analysis-${new Date().toISOString().split('T')[0]}.csv`);
                                                    link.style.visibility = 'hidden';
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                }}
                                                className="gap-2"
                                            >
                                                <Download className="h-4 w-4" />
                                                Export to CSV
                                            </Button>
                                        ) : (
                                            <Link href="/pricing">
                                                <Button
                                                    variant="outline"
                                                    className="gap-2 opacity-75 hover:opacity-100"
                                                >
                                                    <Crown className="h-4 w-4 text-amber-500" />
                                                    Export to CSV (Pro)
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowAnalysisModal(false)}
                                    >
                                        Close
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
