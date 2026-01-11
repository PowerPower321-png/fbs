import { CalculatorForm } from "@/components/calculator/CalculatorForm";
import { ResultsDashboard } from "@/components/calculator/ResultsDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard - FB ROI Checker",
    description: "Calculate your Facebook Ads ROI instantly.",
};

export default function DashboardPage() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 h-full">
                <CalculatorForm />
            </div>
            <div className="lg:col-span-7 h-full">
                <ResultsDashboard />
            </div>

            {/* Mini tip for mobile users */}
            <div className="col-span-1 lg:col-span-12 text-center text-muted-foreground text-sm lg:hidden mb-10">
                Scroll down for results
            </div>
        </div>
    );
}
