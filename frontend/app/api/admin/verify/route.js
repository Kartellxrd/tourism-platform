import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const tokenPayload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    const roles = tokenPayload?.realm_access?.roles || [];
    const isAdmin = roles.includes("admin");

    if (!isAdmin) {
      return NextResponse.json({ isAdmin: false }, { status: 403 });
    }

    return NextResponse.json({
      isAdmin: true,
      user: {
        sub: tokenPayload.sub,
        email: tokenPayload.email,
        name: tokenPayload.name || tokenPayload.preferred_username,
      }
    });

  } catch (error) {
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}