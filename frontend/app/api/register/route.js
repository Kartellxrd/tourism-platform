import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    // 1. Get admin token
    const tokenResponse = await fetch(
      `http://127.0.0.1:8080/realms/PulaPath/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type:    "client_credentials",
          client_id:     process.env.KEYCLOAK_ID,
          client_secret: process.env.KEYCLOAK_SECRET,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Token error:", tokenData);
      return NextResponse.json(
        { message: "Auth service error. Please try again." },
        { status: 500 }
      );
    }

    const access_token = tokenData.access_token;

    // 2. Create user with emailVerified: false
    const createUser = await fetch(
      `http://127.0.0.1:8080/admin/realms/PulaPath/users`,
      {
        method: "POST",
        headers: {
          Authorization:  `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username:      email,
          email:         email,
          firstName,
          lastName,
          enabled:       true,
          emailVerified: false,        // ← must verify email first
          credentials:   [{ type: "password", value: password, temporary: false }],
        }),
      }
    );

    if (!createUser.ok) {
      const err = await createUser.json();
      console.error("Create user error:", err);

      // Handle duplicate email
      if (createUser.status === 409) {
        return NextResponse.json(
          { message: "An account with this email already exists." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { message: err.errorMessage || "Registration failed. Please try again." },
        { status: 400 }
      );
    }

    // 3. Get the new user's ID
    const usersRes = await fetch(
      `http://127.0.0.1:8080/admin/realms/PulaPath/users?email=${encodeURIComponent(email)}&exact=true`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const users  = await usersRes.json();
    const userId = users[0]?.id;

    if (!userId) {
      return NextResponse.json(
        { message: "User created but could not send verification email." },
        { status: 500 }
      );
    }

    // 4. Send verification email
    const verifyRes = await fetch(
      `http://127.0.0.1:8080/admin/realms/PulaPath/users/${userId}/send-verify-email`,
      {
        method:  "PUT",
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    if (!verifyRes.ok) {
      console.error("Verify email error:", await verifyRes.text());
      // User created but email failed — still return success
      // They can request resend later
      return NextResponse.json(
        { message: "Account created but verification email failed. Check your spam or contact support." },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { message: "Account created! Please check your email to verify your account before logging in." },
      { status: 201 }
    );

  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}