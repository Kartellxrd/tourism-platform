import { NextResponse } from "next/server";

export async function POST(req) {
  console.log("--- DEBUG START ---");
  console.log("ID from ENV:", process.env.KEYCLOAK_ID);
  console.log("Secret from ENV:", process.env.KEYCLOAK_SECRET);
  console.log("--- DEBUG END ---");

  try {
    const { firstName, lastName, email, password } = await req.json();

    // FALLBACK: Updated to the new PulaPath realm
    const issuer = process.env.KEYCLOAK_ISSUER || "http://127.0.0.1:8080/realms/PulaPath";

    // 1. Get an Admin Access Token from the PulaPath realm
    const tokenResponse = await fetch(`http://127.0.0.1:8080/realms/PulaPath/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.KEYCLOAK_ID,
        client_secret: process.env.KEYCLOAK_SECRET,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error("Keycloak Token Error:", tokenData);
      return NextResponse.json({ message: "Failed to get admin token" }, { status: 500 });
    }

    const access_token = tokenData.access_token;

    // 2. Create the user in the PulaPath realm
    const createUser = await fetch(`http://127.0.0.1:8080/admin/realms/PulaPath/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        email: email,
        firstName: firstName,
        lastName: lastName,
        enabled: true,
        credentials: [{ type: "password", value: password, temporary: false }],
      }),
    });

    if (createUser.ok) {
      return NextResponse.json({ message: "User Created Successfully" }, { status: 201 });
    } else {
      const errorData = await createUser.json();
      console.error("Keycloak User Error:", errorData);
      return NextResponse.json({ message: errorData.errorMessage || "Registration Failed" }, { status: 400 });
    }
  } catch (error) {
    console.error("FULL SERVER ERROR:", error);
    return NextResponse.json({ message: "Server Error: " + error.message }, { status: 500 });
  }
}