export type ServerWallet = {
  pointsEarned: number;
  pointsSpent: number;
  available: number;
};

export type ServerRedemption = {
  id: string;
  itemId: string;
  cost: number;
  code: string;
  createdAt: string;
};

export type ServerShopItem = {
  id: string;
  brand: string;
  title: string;
  detail: string;
  cost: number;
};

export type WalletSnapshot = {
  profile: { username: string; displayName: string } | null;
  wallet: ServerWallet;
  redemptions: ServerRedemption[];
  catalog: ServerShopItem[];
};

export type QuizStartPayload = {
  sessionId: string;
  discoveryId: string;
  questions: { id: string; q: string; options: string[] }[];
  expiresAt: string;
};

export type QuizSubmitResult = {
  score: number;
  pointsAwarded: number;
  isFirstCollect: boolean;
  isRevisitBonus: boolean;
  wallet: ServerWallet;
};

async function parseJson<T>(res: Response): Promise<T> {
  const body = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(
      typeof body === "object" && body && "error" in body && body.error
        ? String(body.error)
        : `Request failed (${res.status})`,
    );
  }
  return body;
}

export async function fetchWallet(): Promise<WalletSnapshot> {
  const res = await fetch("/api/wallet", { credentials: "include" });
  return parseJson(res);
}

export async function redeemItem(itemId: string): Promise<{
  redemption: ServerRedemption;
  wallet: ServerWallet;
}> {
  const res = await fetch("/api/wallet/redeem", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId }),
  });
  return parseJson(res);
}

export async function startServerQuiz(
  discoveryId: string,
): Promise<QuizStartPayload> {
  const res = await fetch("/api/quiz/start", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ discoveryId }),
  });
  return parseJson(res);
}

export async function submitServerQuiz(
  sessionId: string,
  selectedIndices: number[],
): Promise<QuizSubmitResult> {
  const res = await fetch("/api/quiz/submit", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, selectedIndices }),
  });
  return parseJson(res);
}
