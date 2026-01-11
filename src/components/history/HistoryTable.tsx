"use client";

import { useCalculatorStore } from "@/store/useCalculatorStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Consistent date formatting to avoid hydration mismatch
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export function HistoryTable() {
    const { history, removeFromHistory, clearHistory } = useCalculatorStore();

    if (history.length === 0) {
        return (
            <div className="text-center py-10 opacity-50">
                <p>No history yet. Save a calculation to see it here.</p>
            </div>
        );
    }

    return (
        <GlassCard>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Calculation History</h2>
                <Button variant="destructive" size="sm" onClick={clearHistory}>
                    Clear All
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-secondary/50 text-secondary-foreground">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Date</th>
                            <th className="px-4 py-3">Spend</th>
                            <th className="px-4 py-3">Sales</th>
                            <th className="px-4 py-3">ROAS</th>
                            <th className="px-4 py-3">CPA</th>
                            <th className="px-4 py-3">LTV</th>
                            <th className="px-4 py-3 rounded-r-lg">Action</th>
                        </tr>
                    </thead>
                    <tbody className="space-y-2">
                        <AnimatePresence>
                            {history.map((item, index) => (
                                <motion.tr
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border-b border-border/50 hover:bg-secondary/20"
                                >
                                    <td className="px-4 py-3 font-medium">
                                        {formatDate(item.date)}
                                    </td>
                                    <td className="px-4 py-3">{formatCurrency(item.spend)}</td>
                                    <td className="px-4 py-3">{formatCurrency(item.sales)}</td>
                                    <td className={`px-4 py-3 font-bold ${item.roas >= 4 ? 'text-success' :
                                            item.roas < 2 ? 'text-destructive' : 'text-warning'
                                        }`}>
                                        {item.roas.toFixed(2)}x
                                    </td>
                                    <td className="px-4 py-3">{formatCurrency(item.cpa)}</td>
                                    <td className="px-4 py-3">{formatCurrency(item.ltv)}</td>
                                    <td className="px-4 py-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFromHistory(item.id)}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
}
