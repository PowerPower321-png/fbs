import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    console.log("=== UPGRADE PRO API CALLED ===");
    
    try {
        // Verify the user is authenticated
        const supabase = createServerClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        console.log("Current user:", currentUser?.id, currentUser?.email);

        // Also check for demo mode
        const cookieStore = cookies();
        const isDemoMode = cookieStore.get("demo_user")?.value === "true";
        console.log("Demo mode:", isDemoMode);

        if (!currentUser && !isDemoMode) {
            console.log("Unauthorized - no user and not demo mode");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { userId, renewalDate } = body;
        console.log("Request body:", { userId, renewalDate });

        // Create admin client for database updates
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Update the custom users table - use ID to match RLS policy
        if (currentUser) {
            console.log("Updating users table for user:", currentUser.id);
            
            // First check if user exists in users table
            const { data: existingUser } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('id', currentUser.id)
                .single();

            if (!existingUser) {
                // Create user record if it doesn't exist
                const { error: insertError } = await supabaseAdmin
                    .from('users')
                    .insert({
                        id: currentUser.id,
                        email: currentUser.email,
                        full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0],
                        subscription_status: 'pro'
                    });

                if (insertError) {
                    console.error("Error creating user:", insertError);
                    return NextResponse.json({ error: "Failed to create user: " + insertError.message }, { status: 500 });
                }
            } else {
                // Update existing user
                const { error } = await supabaseAdmin
                    .from('users')
                    .update({ subscription_status: 'pro' })
                    .eq('id', currentUser.id);

                if (error) {
                    console.error("Error updating users table by ID:", error);
                    return NextResponse.json({ error: "Failed to upgrade: " + error.message }, { status: 500 });
                }
            }

            console.log("User upgraded to Pro successfully!");

            // Also update auth metadata
            try {
                await supabaseAdmin.auth.admin.updateUserById(currentUser.id, {
                    user_metadata: {
                        is_pro: true,
                        plan_name: "pro",
                        renewal_date: renewalDate,
                        upgraded_at: new Date().toISOString()
                    }
                });
                console.log("Auth metadata updated");
            } catch (metaError) {
                console.error("Error updating auth metadata (non-critical):", metaError);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Upgrade error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


