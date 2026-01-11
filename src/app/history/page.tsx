import { HistoryTable } from "@/components/history/HistoryTable";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "History - FB ROI Checker",
    description: "View your past calculations.",
};

export default function HistoryPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Saved Calculations</h1>
            <HistoryTable />
        </div>
    );
}
