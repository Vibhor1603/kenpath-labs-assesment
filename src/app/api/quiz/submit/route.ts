import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: { sessionId?: string; selectedIndices?: unknown; score?: unknown };
  try {
    body = (await request.json()) as {
      sessionId?: string;
      selectedIndices?: unknown;
      score?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // Reject forged score payloads — only selected indices are accepted.
  if (body.score !== undefined) {
    return NextResponse.json(
      { error: "Client scores are not accepted." },
      { status: 400 },
    );
  }

  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required." }, { status: 400 });
  }

  if (
    !Array.isArray(body.selectedIndices) ||
    !body.selectedIndices.every(
      (n) => typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 3,
    )
  ) {
    return NextResponse.json(
      { error: "selectedIndices must be five ints 0–3." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase.rpc("submit_quiz", {
    p_session_id: sessionId,
    p_selected_indices: body.selectedIndices,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}
