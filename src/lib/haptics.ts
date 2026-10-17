export function canVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

export function vibrateCorrect(enabled: boolean): void {
  if (!enabled || !canVibrate()) return;
  navigator.vibrate(12);
}

export function vibrateReward(enabled: boolean): void {
  if (!enabled || !canVibrate()) return;
  navigator.vibrate([10, 60, 20]);
}
