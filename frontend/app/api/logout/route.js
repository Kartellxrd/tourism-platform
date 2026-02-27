import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token"); // Deletes the session cookie
  return NextResponse.json({ message: "Logged out" });
}