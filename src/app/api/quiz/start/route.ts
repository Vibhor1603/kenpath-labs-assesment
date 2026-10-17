import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const DISCOVERIES = new Set(["fridge", "leaf", "heart"]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: { discoveryId?: string };
  try {
    body = (await request.json()) as { discoveryId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const discoveryId =
    typeof body.discoveryId === "string" ? body.discoveryId.trim() : "";
  if (!DISCOVERIES.has(discoveryId)) {
    return NextResponse.json({ error: "Invalid discovery." }, { status: 400 });
  }

  // Returns shuffled questions WITHOUT correct answers.
  const { data, error } = await supabase.rpc("start_quiz", {
    p_discovery_id: discoveryId,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}
