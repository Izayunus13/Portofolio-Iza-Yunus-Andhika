import * as T from 'three';

export const sailingRamp=.28;
export const sailingCruiseSpeed=6;

/** Keep cruise speed consistent while allowing time for acceleration and braking. */
export function sailingDuration(distance:number):number {
  return Math.max(4.2,Math.abs(distance)/(sailingCruiseSpeed*(1-sailingRamp)))*1000;
}

/** Acceleration eases into a steady cruise, then eases all the way to rest. */
export function sailingEase(progress: number): number {
  const t = T.MathUtils.clamp(progress, 0, 1), ramp = sailingRamp;
  if (t > 1 - ramp) return 1 - sailingEase(1 - t);
  if (t >= ramp) return (t - ramp / 2) / (1 - ramp);
  const u = t / ramp;
  return ramp * (u ** 6 - 3 * u ** 5 + 2.5 * u ** 4) / (1 - ramp);
}

export type Spring = { value: number; velocity: number };
/** Exact critically damped spring step; stable across different frame rates. */
export function stepSpring(state: Spring, target: number, smoothTime: number, dt: number) {
  const omega = 2 / smoothTime, decay = Math.exp(-omega * dt);
  const offset = state.value - target, step = (state.velocity + omega * offset) * dt;
  state.value = target + (offset + step) * decay;
  state.velocity = (state.velocity - omega * step) * decay;
  return state.value;
}

export function angleDifference(target: number, current: number) {
  return T.MathUtils.euclideanModulo(target - current + Math.PI, Math.PI * 2) - Math.PI;
}

/** One physical distance scale prevents speed jumps between unequal route legs. */
export function createVoyagePath(curves: T.CubicBezierCurve3[]) {
  const lengths = curves.map(curve => curve.getLength());
  const ends: number[] = [0];
  lengths.forEach(length => ends.push(ends[ends.length - 1] + length));
  function routeAtDistance(distance: number) {
    const d = T.MathUtils.clamp(distance, 0, ends[ends.length - 1]);
    const index = lengths.findIndex((_, i) => d < ends[i + 1]);
    return index < 0 ? lengths.length : index + (d - ends[index]) / lengths[index];
  }
  return {
    length: ends[ends.length - 1],
    distanceAtRoute(route: number) {
      const r = T.MathUtils.clamp(route, 0, lengths.length), index = Math.min(lengths.length - 1, Math.floor(r));
      return ends[index] + (r - index) * lengths[index];
    },
    routeAtDistance,
    sample(distance: number, position: T.Vector3, tangent?: T.Vector3) {
      const route = routeAtDistance(distance), index = Math.min(lengths.length - 1, Math.floor(route));
      curves[index].getPointAt(route - index, position);
      if (tangent) curves[index].getTangentAt(route - index, tangent);
    },
  };
}
