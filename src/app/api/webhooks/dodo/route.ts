import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase with service role key for admin access


export async function POST(request: Request) {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const payload = await request.json();
        
        console.log("Dodo Webhook received:", JSON.stringify(payload, null, 2));

        // Handle different event types from Dodo Payments
        const eventType = payload.event_type || payload.type;
        
        if (eventType === "payment.succeeded" || eventType === "checkout.completed") {
            const metadata = payload.data?.metadata || payload.metadata || {};
            const userId = metadata.user_id;
            const customerEmail = payload.data?.customer?.email || payload.customer_email;
            
            if (!userId && !customerEmail) {
                console.error("No user_id or email in webhook payload");
                return NextResponse.json({ error: "Missing user identifier" }, { status: 400 });
            }

            // Calculate renewal date (30 days from now for monthly subscription)
            const renewalDate = new Date();
            renewalDate.setDate(renewalDate.getDate() + 30);

            // Update user metadata with Pro status
            if (userId) {
                await supabaseAdmin.auth.admin.updateUserById(userId, {
                    user_metadata: { 
                        is_pro: true,
                        plan_name: "pro",
                        renewal_date: renewalDate.toISOString(),
                        upgraded_at: new Date().toISOString()
                    }
                });
            }

            // Also try to update by email if userId is demo
            if (customerEmail && (!userId || userId === "demo-user-id")) {
                const { data: users } = await supabaseAdmin.auth.admin.listUsers();
                const user = users.users.find(u => u.email === customerEmail);
                if (user) {
                    await supabaseAdmin.auth.admin.updateUserById(user.id, {
                        user_metadata: { 
                            is_pro: true,
                            plan_name: "pro",
                            renewal_date: renewalDate.toISOString(),
                            upgraded_at: new Date().toISOString()
                        }
                    });
                }
            }

            console.log("User upgraded to Pro:", userId || customerEmail);
            return NextResponse.json({ success: true });
        }

        // Handle subscription cancellation
        if (eventType === "subscription.cancelled" || eventType === "payment.failed") {
            const metadata = payload.data?.metadata || payload.metadata || {};
            const userId = metadata.user_id;

            if (userId) {
                await supabaseAdmin.auth.admin.updateUserById(userId, {
                    user_metadata: { is_pro: false }
                });
            }

            return NextResponse.json({ success: true });
        }

        // Acknowledge other events
        return NextResponse.json({ received: true });

    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}

// Handle GET for webhook verification
export async function GET() {
    return NextResponse.json({ status: "Webhook endpoint active" });
}
