import { Metadata } from "next";
import { Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Support - FB ROI Checker",
    description: "Get help and support for FB ROI Checker",
};

export default function SupportPage() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Contact Support
                </h1>
                <p className="text-lg text-muted-foreground">
                    We&apos;re here to help! Choose how you&apos;d like to reach us.
                </p>
            </div>

            <div className="max-w-xl mx-auto">
                {/* Email Support */}
                <GlassCard className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">Email Support</h3>
                            <p className="text-muted-foreground mb-4">
                                Send us an email and we&apos;ll get back to you within 24 hours.
                            </p>
                            <a href="mailto:its.sudhan167@gmail.com">
                                <Button className="w-full">
                                    <Mail className="mr-2 h-4 w-4" />
                                    its.sudhan167@gmail.com
                                </Button>
                            </a>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Response Time */}
            <GlassCard className="mt-8 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-1">Response Time</h3>
                        <p className="text-muted-foreground">
                            We typically respond within <strong>2-4 hours</strong> during business hours (9 AM - 6 PM IST, Mon-Sat).
                            Pro users get priority support!
                        </p>
                    </div>
                </div>
            </GlassCard>

            {/* FAQ Section */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
                
                <div className="space-y-4">
                    <GlassCard className="p-5">
                        <h4 className="font-bold mb-2">How do I upgrade to Pro?</h4>
                        <p className="text-muted-foreground">
                            Go to the <Link href="/pricing" className="text-primary hover:underline">Pricing page</Link> and click &quot;Upgrade to Pro&quot;. 
                            You&apos;ll be redirected to our secure payment page.
                        </p>
                    </GlassCard>
                    
                    <GlassCard className="p-5">
                        <h4 className="font-bold mb-2">I made a payment but my account isn&apos;t upgraded</h4>
                        <p className="text-muted-foreground">
                            Please wait a few minutes and refresh the page. If it still doesn&apos;t work, 
                            contact us with your email and payment confirmation, and we&apos;ll resolve it immediately.
                        </p>
                    </GlassCard>
                    
                    <GlassCard className="p-5">
                        <h4 className="font-bold mb-2">Can I get a refund?</h4>
                        <p className="text-muted-foreground">
                            Yes! We offer a 7-day money-back guarantee. Contact support within 7 days of purchase 
                            for a full refund, no questions asked.
                        </p>
                    </GlassCard>
                    
                    <GlassCard className="p-5">
                        <h4 className="font-bold mb-2">Is my data secure?</h4>
                        <p className="text-muted-foreground">
                            Absolutely! Your calculation data is stored locally on your device using IndexedDB. 
                            We only store your email for authentication purposes.
                        </p>
                    </GlassCard>
                </div>
            </div>

            {/* Back to Dashboard */}
            <div className="mt-12 text-center">
                <Link href="/dashboard">
                    <Button variant="outline" size="lg">
                        ← Back to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
}
