import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const response = await fetch(`http://127.0.0.1:8080/realms/PulaPath/protocol/openid-connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "password",
        client_id: process.env.KEYCLOAK_ID,
        client_secret: process.env.KEYCLOAK_SECRET,
        username: email,
        password: password,
        scope: "openid",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Store the token in a secure cookie
      const cookieStore = await cookies();
      cookieStore.set("auth_token", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      });

      return NextResponse.json({ message: "Login Successful" }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}