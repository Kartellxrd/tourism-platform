import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const response = await fetch(
      `http://127.0.0.1:8080/realms/PulaPath/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type:    "password",
          client_id:     process.env.KEYCLOAK_ID,
          client_secret: process.env.KEYCLOAK_SECRET,
          username:      email,
          password:      password,
          scope:         "openid",
        }),
      }
    );

    const data = await response.json();

    // Email not verified
    if (
      data.error === "invalid_grant" &&
      data.error_description?.toLowerCase().includes("verif")
    ) {
      return NextResponse.json(
        { message: "Please verify your email before logging in. Check your inbox and spam folder." },
        { status: 403 }
      );
    }

    // Wrong credentials
    if (!response.ok) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Success — set cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", data.access_token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      maxAge:   60 * 60 * 24, // 24 hours
      path:     "/",
      sameSite: "lax",
    });

    return NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}