import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { id } = params;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/bookings/cancel/${id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.detail || "Cancel failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}