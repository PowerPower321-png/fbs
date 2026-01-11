import { NextRequest, NextResponse } from 'next/server';

// Smart local analysis engine - no external API needed
function generateAnalysis(metrics: {
    spend: number;
    clicks: number;
    sales: number;
    customers: number;
    repeatRate: number;
    roas: number;
    cpa: number;
    ltv: number;
    conversionRate: string;
    benchmark: string;
    status: string;
}): string {
    const { spend, clicks, sales, customers, repeatRate, roas, cpa, ltv, conversionRate, benchmark } = metrics;
    
    const convRate = parseFloat(conversionRate) || 0;
    const profit = sales - spend;
    const profitMargin = spend > 0 ? ((profit / spend) * 100).toFixed(1) : '0';
    const avgOrderValue = customers > 0 ? (sales / customers).toFixed(2) : '0';
    const costPerClick = clicks > 0 ? (spend / clicks).toFixed(2) : '0';
    
    // Determine performance tier
    let performanceTier: 'excellent' | 'good' | 'average' | 'poor';
    if (roas >= 4) performanceTier = 'excellent';
    else if (roas >= 2.5) performanceTier = 'good';
    else if (roas >= 2) performanceTier = 'average';
    else performanceTier = 'poor';
    
    // Build dynamic analysis
    let analysis = '';
    
    // Executive Summary
    analysis += `## 📊 Executive Summary\n\n`;
    if (performanceTier === 'excellent') {
        analysis += `This campaign is performing **exceptionally well** with a ${roas.toFixed(2)}x ROAS, placing it in the **${benchmark}** of e-commerce advertisers. `;
        analysis += `You're generating $${profit.toLocaleString()} in profit from your $${spend.toLocaleString()} ad spend. `;
        analysis += `This campaign is ready for aggressive scaling.\n\n`;
    } else if (performanceTier === 'good') {
        analysis += `This campaign shows **solid performance** with a ${roas.toFixed(2)}x ROAS. `;
        analysis += `You're generating $${profit.toLocaleString()} in profit from your $${spend.toLocaleString()} ad spend. `;
        analysis += `There's room for optimization before scaling aggressively.\n\n`;
    } else if (performanceTier === 'average') {
        analysis += `This campaign is **breaking even or marginally profitable** with a ${roas.toFixed(2)}x ROAS. `;
        analysis += `Close monitoring and optimization are needed before increasing spend.\n\n`;
    } else {
        analysis += `⚠️ This campaign is **underperforming** with a ${roas.toFixed(2)}x ROAS, which is below the industry standard of 2.0x. `;
        analysis += `You're losing $${Math.abs(profit).toLocaleString()} on this campaign. Immediate action is required.\n\n`;
    }
    
    // Performance Assessment
    analysis += `## 📈 Performance Assessment\n\n`;
    analysis += `| Metric | Your Value | Industry Benchmark | Status |\n`;
    analysis += `|--------|------------|-------------------|--------|\n`;
    analysis += `| ROAS | ${roas.toFixed(2)}x | 2.0x - 4.0x | ${roas >= 2 ? '✅ Good' : '❌ Below Average'} |\n`;
    analysis += `| CPA | $${cpa.toFixed(2)} | Varies by industry | ${cpa < (sales/customers) ? '✅ Healthy' : '⚠️ Monitor'} |\n`;
    analysis += `| Conv. Rate | ${conversionRate}% | 1% - 3% | ${convRate >= 1 ? '✅ Good' : '❌ Needs Work'} |\n`;
    analysis += `| LTV | $${ltv.toFixed(2)} | Depends on product | ${ltv > cpa ? '✅ Positive' : '⚠️ Monitor'} |\n\n`;
    
    if (roas >= 2) {
        analysis += `**Profitability:** ✅ This campaign is profitable with a ${profitMargin}% return on ad spend.\n\n`;
    } else {
        analysis += `**Profitability:** ❌ This campaign is currently not profitable. You're losing $${(spend - sales).toFixed(2)} per $${spend} spent.\n\n`;
    }
    
    // Strengths
    analysis += `## 💪 Strengths\n\n`;
    const strengths: string[] = [];
    
    if (roas >= 3) strengths.push(`**Strong ROAS:** Your ${roas.toFixed(2)}x return significantly exceeds the 2.0x industry average`);
    if (convRate >= 2) strengths.push(`**High Conversion Rate:** ${conversionRate}% click-to-customer rate indicates strong targeting and offer alignment`);
    if (ltv > cpa * 1.5) strengths.push(`**Healthy LTV:CPA Ratio:** Your customer lifetime value ($${ltv.toFixed(2)}) is ${(ltv/cpa).toFixed(1)}x your acquisition cost`);
    if (repeatRate >= 1.2) strengths.push(`**Good Repeat Business:** ${repeatRate}x repeat rate shows customer satisfaction and loyalty`);
    if (parseFloat(avgOrderValue) > 50) strengths.push(`**Solid Average Order Value:** $${avgOrderValue} per customer provides healthy margins`);
    
    if (strengths.length === 0) {
        strengths.push(`Room for improvement in most metrics - this analysis will help you optimize`);
    }
    
    strengths.forEach(s => analysis += `- ${s}\n`);
    analysis += '\n';
    
    // Areas for Improvement
    analysis += `## 🎯 Areas for Improvement\n\n`;
    const improvements: string[] = [];
    
    if (roas < 2) improvements.push(`**Increase ROAS:** Currently at ${roas.toFixed(2)}x, aim for at least 2.0x to break even after costs`);
    if (convRate < 1) improvements.push(`**Boost Conversion Rate:** ${conversionRate}% is below the 1% minimum. Review your landing page and offer`);
    if (cpa > ltv) improvements.push(`**Reduce CPA:** Your acquisition cost ($${cpa.toFixed(2)}) exceeds customer lifetime value ($${ltv.toFixed(2)})`);
    if (repeatRate < 1.1) improvements.push(`**Improve Repeat Purchase Rate:** Focus on email marketing and retention strategies`);
    if (clicks > 0 && parseFloat(costPerClick) > 2) improvements.push(`**Optimize CPC:** $${costPerClick} per click is high - consider audience refinement`);
    
    if (improvements.length === 0) {
        improvements.push(`Your metrics look solid! Focus on scaling while maintaining performance`);
    }
    
    improvements.forEach(i => analysis += `- ${i}\n`);
    analysis += '\n';
    
    // Actionable Recommendations
    analysis += `## 🚀 Actionable Recommendations\n\n`;
    
    if (performanceTier === 'excellent' || performanceTier === 'good') {
        analysis += `1. **Scale Budget Gradually:** Increase daily budget by 20-30% every 3-4 days while monitoring ROAS\n`;
        analysis += `2. **Duplicate Winning Ad Sets:** Create copies of your best-performing audiences to find more scale\n`;
        analysis += `3. **Expand Lookalike Audiences:** Build 1%, 2%, and 3% lookalikes from your customer list\n`;
        analysis += `4. **Test New Creatives:** Develop 3-5 new ad variations to combat creative fatigue\n`;
        analysis += `5. **Implement Retargeting:** Set up website visitor and cart abandoner retargeting\n`;
        analysis += `6. **Optimize for Value:** Switch to value-based optimization if not already using it\n`;
    } else {
        analysis += `1. **Audit Your Targeting:** Review audience settings - you may be reaching the wrong people\n`;
        analysis += `2. **Refresh Creatives:** Poor performance often indicates creative fatigue or weak messaging\n`;
        analysis += `3. **Review Landing Page:** Ensure fast load times, clear CTA, and mobile optimization\n`;
        analysis += `4. **Check Offer Alignment:** Make sure your ad promise matches what customers find on the landing page\n`;
        analysis += `5. **Reduce Spend Temporarily:** Lower budget while testing optimizations to minimize losses\n`;
        analysis += `6. **A/B Test Aggressively:** Test one variable at a time - headline, image, audience, placement\n`;
        analysis += `7. **Review Purchase Journey:** Check for friction points in checkout process\n`;
    }
    analysis += '\n';
    
    // Scaling Strategy
    analysis += `## 📈 Scaling Strategy\n\n`;
    
    if (performanceTier === 'excellent') {
        analysis += `🟢 **Aggressive Scaling Recommended**\n\n`;
        analysis += `Your campaign is in the sweet spot for scaling. Here's your playbook:\n\n`;
        analysis += `- **Week 1-2:** Increase budget by 20% every 3 days\n`;
        analysis += `- **Week 3-4:** Launch 2-3 new lookalike audiences\n`;
        analysis += `- **Week 5-6:** Expand to additional placements (Stories, Reels)\n`;
        analysis += `- **Ongoing:** Refresh creatives every 2-3 weeks\n`;
    } else if (performanceTier === 'good') {
        analysis += `🟡 **Cautious Scaling Recommended**\n\n`;
        analysis += `Optimize first, then scale:\n\n`;
        analysis += `- **Week 1-2:** Test 3-5 new ad creatives\n`;
        analysis += `- **Week 3-4:** If ROAS holds, increase budget by 15% weekly\n`;
        analysis += `- **Week 5+:** Expand to new audiences gradually\n`;
    } else {
        analysis += `🔴 **Pause Scaling - Focus on Optimization**\n\n`;
        analysis += `Before scaling, you need to hit at least 2.0x ROAS:\n\n`;
        analysis += `- **Immediate:** Reduce budget by 50% to minimize losses\n`;
        analysis += `- **Week 1-2:** Test new creatives and audiences at low budget\n`;
        analysis += `- **Week 3-4:** Scale only ad sets that achieve 2.5x+ ROAS\n`;
    }
    analysis += '\n';
    
    // Risk Factors
    analysis += `## ⚠️ Risk Factors to Monitor\n\n`;
    analysis += `- **Creative Fatigue:** Performance typically drops after 2-3 weeks with same creatives\n`;
    analysis += `- **Audience Saturation:** Watch frequency metrics - above 3x indicates oversaturation\n`;
    analysis += `- **Seasonality:** Be prepared for fluctuations during holidays and events\n`;
    analysis += `- **iOS Privacy Changes:** Ensure you have server-side tracking and CAPI set up\n`;
    analysis += `- **Competition:** Monitor if CPC increases indicate new competitors\n\n`;
    
    // Key Metrics Summary
    analysis += `## 📋 Key Metrics Summary\n\n`;
    analysis += `| Metric | Value |\n`;
    analysis += `|--------|-------|\n`;
    analysis += `| Total Ad Spend | $${spend.toLocaleString()} |\n`;
    analysis += `| Total Revenue | $${sales.toLocaleString()} |\n`;
    analysis += `| Net Profit | $${profit.toLocaleString()} |\n`;
    analysis += `| ROAS | ${roas.toFixed(2)}x |\n`;
    analysis += `| CPA | $${cpa.toFixed(2)} |\n`;
    analysis += `| LTV | $${ltv.toFixed(2)} |\n`;
    analysis += `| Customers Acquired | ${customers} |\n`;
    analysis += `| Cost Per Click | $${costPerClick} |\n`;
    
    return analysis;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { spend, clicks, sales, customers, repeatRate, roas, cpa, ltv, conversionRate, benchmark, status } = body;

        // Validate required fields
        if (!spend || !sales || !customers) {
            return NextResponse.json(
                { error: 'Missing required calculation data' },
                { status: 400 }
            );
        }

        // Generate analysis locally - no external API needed
        const analysis = generateAnalysis({
            spend: Number(spend),
            clicks: Number(clicks) || 0,
            sales: Number(sales),
            customers: Number(customers),
            repeatRate: Number(repeatRate) || 1,
            roas: Number(roas) || 0,
            cpa: Number(cpa) || 0,
            ltv: Number(ltv) || 0,
            conversionRate: String(conversionRate) || '0',
            benchmark: String(benchmark) || 'Average',
            status: String(status) || 'Unknown'
        });

        return NextResponse.json({ analysis });
    } catch (error) {
        console.error('Analysis API Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate analysis' },
            { status: 500 }
        );
    }
}
