"use client";

import { onToast, type ToastMessage } from "@/lib/toast";
import { useEffect, useState } from "react";

const VISIBLE_MS = 3600;

/** One toast at a time, above the bottom bar. Announced politely. */
export function Toaster() {
  const [message, setMessage] = useState<ToastMessage | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(
    () =>
      onToast((m) => {
        setLeaving(false);
        setMessage(m);
      }),
    [],
  );

  useEffect(() => {
    if (!message) return;
    const out = setTimeout(() => setLeaving(true), VISIBLE_MS);
    const gone = setTimeout(() => setMessage(null), VISIBLE_MS + 200);
    return () => {
      clearTimeout(out);
      clearTimeout(gone);
    };
  }, [message]);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom))] z-40 flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      {message ? (
        <p
          key={message.id}
          className="anim-rise-in bg-ink text-surface max-w-[360px] rounded-2xl px-4 py-3 text-center text-[15px] leading-[21px] shadow-[var(--shadow-lg)] transition-opacity duration-200"
          style={{ opacity: leaving ? 0 : 1 }}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
