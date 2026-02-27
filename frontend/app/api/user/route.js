import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    // Call Keycloak UserInfo endpoint
    const response = await fetch(`http://127.0.0.1:8080/realms/PulaPath/protocol/openid-connect/userinfo`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const userData = await response.json();

    if (response.ok) {
      return NextResponse.json(userData);
    } else {
      return NextResponse.json({ message: "Session expired" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Error fetching user" }, { status: 500 });
  }
}