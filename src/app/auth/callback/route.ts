import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    console.log("Auth callback received:", { code: code?.substring(0, 20) + "...", next });

    if (code) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        console.log("Exchange result:", { 
            success: !error, 
            userId: data?.user?.id,
            email: data?.user?.email,
            error: error?.message 
        });

        if (!error) {
            console.log("Redirecting to:", `${origin}${next}`);
            return NextResponse.redirect(`${origin}${next}`);
        } else {
            console.error("Auth error:", error);
        }
    } else {
        console.log("No code received in callback");
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

