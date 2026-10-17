/**
 * Demo mapping from Kenpath Points to "reward units".
 * A live Kenpath product would check scores on a server, then unlock real
 * rewards. This build never pays out; units are for the demo wallet only.
 */
export const POINTS_PER_REWARD_UNIT = 10;

export function demoRewardUnits(points: number): number {
  return Math.floor(Math.max(0, points) / POINTS_PER_REWARD_UNIT);
}
