// frontend/app/api/wishlist/route.js

import { NextResponse } from "next/server";

const FASTAPI = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// GET /api/wishlist
export async function GET(request) {
  try {
    // Read cookie directly from request — correct way in Next.js 15/16
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const res = await fetch(`${FASTAPI}/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("GET /api/wishlist error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST /api/wishlist
export async function POST(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();

    const res = await fetch(`${FASTAPI}/wishlist`, {
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
  } catch (error) {
    console.error("POST /api/wishlist error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}