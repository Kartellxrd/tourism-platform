import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const FASTAPI = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function PUT(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { booking_id } = await params;

    const res = await fetch(`${FASTAPI}/bookings/${booking_id}/confirm`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("PUT booking error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { booking_id } = await params;

    const res = await fetch(`${FASTAPI}/bookings/${booking_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("DELETE booking error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}