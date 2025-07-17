import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function POST(req: NextRequest) {
  try {
    // Optional: Add this for debugging (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.log("Environment check:", {
        hasApiKey: !!process.env.LIVEKIT_API_KEY,
        hasApiSecret: !!process.env.LIVEKIT_API_SECRET,
        hasUrl: !!process.env.NEXT_PUBLIC_LIVEKIT_URL,
      });
    }

    // Change this line to match frontend parameter names
    const body = await req.json();
    console.log("Received body:", body); // Debug log

    const { room, username } = body;

    if (!room) {
      return NextResponse.json(
        { error: "Missing room parameter" },
        { status: 400 }
      );
    }

    if (!username) {
      return NextResponse.json(
        { error: "Missing username parameter" },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    console.log("a");
    const at = new AccessToken(apiKey, apiSecret, {
      identity: username, // Use username here
      name: username, // Use username here
    });
    console.log("b");

    at.addGrant({
      room: room, // Use room here
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();
    console.log("Generated token:", token);
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Token generation error:", error); // Add logging
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
