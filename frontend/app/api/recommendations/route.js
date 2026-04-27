import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const FASTAPI = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    // Get user_id from query params if passed
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id") || "";

    const url = user_id
      ? `${FASTAPI}/recommendations?user_id=${user_id}`
      : `${FASTAPI}/recommendations`;

    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}