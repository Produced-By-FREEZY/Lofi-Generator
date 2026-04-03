import { NextResponse } from "next/server";

export async function POST() {
  const webhookUrl = process.env.WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { error: "WEBHOOK_URL environment variable is not set." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ triggered: true, timestamp: new Date().toISOString() }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Webhook responded with status ${response.status}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
