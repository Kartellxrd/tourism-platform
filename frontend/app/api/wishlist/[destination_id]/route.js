// frontend/app/api/wishlist/[destination_id]/route.js

import { NextResponse } from "next/server";

const FASTAPI = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// DELETE /api/wishlist/[destination_id]
export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { destination_id } = await params;

    const res = await fetch(`${FASTAPI}/wishlist/${destination_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("DELETE /api/wishlist error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// GET /api/wishlist/[destination_id] — check if saved
export async function GET(request, { params }) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { destination_id } = await params;

    const res = await fetch(`${FASTAPI}/wishlist/check/${destination_id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("GET /api/wishlist/check error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}