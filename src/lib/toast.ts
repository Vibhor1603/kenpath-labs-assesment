export type ToastMessage = { id: number; text: string };

const EVENT = "hw:toast";
let nextId = 1;

/** Shows a short message at the bottom of the app. Safe to call from anywhere. */
export function toast(text: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ToastMessage>(EVENT, { detail: { id: nextId++, text } }),
  );
}

export function onToast(listener: (message: ToastMessage) => void): () => void {
  const handler = (e: Event) => listener((e as CustomEvent<ToastMessage>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
