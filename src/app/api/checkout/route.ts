import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check for demo mode cookie
    const cookieStore = cookies();
    const isDemoMode = cookieStore.get("demo_user")?.value === "true";

    // Allow either real user or demo mode
    const userEmail = user?.email || (isDemoMode ? "demo@fbroichecker.com" : null);
    const userId = user?.id || (isDemoMode ? "demo-user-id" : null);

    if (!userEmail) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Implementation for Dodo Payments Session Creation
    try {
        const DODO_API_KEY = process.env.DODO_PAYMENTS_API_KEY;
        // const DODO_PRODUCT_ID = "prod_123"; 

        if (!DODO_API_KEY) {
            console.error("Dodo API Key is missing");
            throw new Error("Missing Dodo API Key");
        }

        // Select product ID based on live/test mode
        const isLiveMode = process.env.DODO_LIVE_MODE === "true";
        const productId = isLiveMode 
            ? "pdt_0NUpW86SzLJHPRY41yPZY"  // Live product ID
            : "pdt_0NUtUB2KRxEzGxncuEpZS"; // Test product ID

        const payload = {
            customer: {
                email: userEmail,
            },
            billing: {
                country: "IN",
            },
            product_cart: [{
                product_id: productId,
                quantity: 1,
                amount: 100 // 100 paise = 1 INR
            }],
            return_url: `${request.headers.get("origin")}/payment-success?success=true`,
            metadata: {
                user_id: userId
            }
        };

        console.log("Dodo Payload:", JSON.stringify(payload, null, 2));

        // Use the already declared isLiveMode to select endpoint
        const dodoEndpoint = isLiveMode 
            ? "https://live.dodopayments.com/checkouts" 
            : "https://test.dodopayments.com/checkouts";
        
        console.log("Using Dodo endpoint:", dodoEndpoint, "Live mode:", isLiveMode);
        
        const response = await fetch(dodoEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${DODO_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        console.log("Dodo Raw Response:", response.status, responseText);

        let session;
        try {
            session = JSON.parse(responseText);
        } catch {
            console.error("Failed to parse Dodo response as JSON:", responseText);
            throw new Error("Invalid response from Dodo");
        }

        if (!response.ok) {
            console.error("Dodo API Error:", session);
            return NextResponse.json({ error: session.message || session.error || "Dodo API Error" }, { status: response.status });
        }

        console.log("Dodo Session created details:", session);
        // Dodo returns checkout_url, not url
        return NextResponse.json({ url: session.checkout_url || session.url });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
