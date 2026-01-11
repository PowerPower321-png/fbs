import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ success: true, message: "Demo mode activated" });
    
    // Set demo user cookie (expires in 1 hour)
    response.cookies.set("demo_user", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60, // 1 hour
        path: "/"
    });

    return response;
}
