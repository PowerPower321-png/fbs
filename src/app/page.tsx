"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, BarChart2, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 max-w-3xl"
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-blue-500/10 text-primary font-medium text-sm border border-primary/20">
          <Sparkles className="w-4 h-4" />
          v1.0 Now Live
        </span>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
          Stop Wasting <br />
          <span className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
            $5,000/mo
          </span>{" "}
          on Bad Ads
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Instantly calculate your Facebook Ads ROAS, LTV, and CPA. Get
          AI-powered advice on whether to scale or kill your campaigns.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/dashboard">
            <Button size="lg" className="h-14 text-lg px-8 rounded-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-xl shadow-primary/25">
              Use Calculator Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button
              variant="outline"
              size="lg"
              className="h-14 text-lg px-8 rounded-full border-2 hover:bg-slate-50"
            >
              View Pricing
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl mt-20">
        {[
          {
            icon: Zap,
            title: "Instant Analysis",
            desc: "Get immediate feedback on your ad metrics with color-coded alerts.",
            color: "from-yellow-400 to-orange-500",
          },
          {
            icon: BarChart2,
            title: "Industry Benchmarks",
            desc: "See how your CPA and ROAS compare to top 20% of e-com stores.",
            color: "from-primary to-blue-600",
          },
          {
            icon: ShieldCheck,
            title: "Privacy First",
            desc: "Your data stays on your device. We use LocalStorage & IndexedDB.",
            color: "from-emerald-400 to-teal-500",
          },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="group p-6 rounded-2xl bg-white border border-slate-200 text-left shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">{item.title}</h3>
            <p className="text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Trust Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-6 mt-12 text-sm text-muted-foreground"
      >
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          100% Free to Start
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          No Credit Card Required
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Instant Results
        </span>
      </motion.div>
    </div>
  );
}
