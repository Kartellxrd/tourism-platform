import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const FASTAPI = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const body = await req.json();

    const res = await fetch(`${FASTAPI}/ai/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}