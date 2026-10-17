type NavLike = {
  hardwareConcurrency?: number;
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

export function isLiteDevice(nav: NavLike = typeof navigator !== "undefined" ? navigator : {}): boolean {
  if ((nav.hardwareConcurrency ?? 8) <= 4) return true;
  if ((nav.deviceMemory ?? 8) <= 2) return true;
  if (nav.connection?.saveData) return true;
  return false;
}
