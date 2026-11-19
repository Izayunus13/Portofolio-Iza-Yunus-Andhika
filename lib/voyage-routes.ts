import * as T from 'three';
import { voyageDestinations } from './destinations';
import { islandSandTop } from './island-shore';
import type { V3 } from './three-kit';
import { certificateIslandOffset, certificateIslandRadius } from './certificate-islands';

// Keep the complete ship (bowsprit included) in open water, even while turning.
export const shipClearance = 5.9;
export const shoreTitleOffset = [.2, islandSandTop, 2.4] as const;
const islandCenters: V3[] = [[-3, 0, -10], [16, 0, -8], [33, 0, -18], [50, 0, -29]];
export const ports = islandCenters.map((island, index) => ({
  name: voyageDestinations[index].name,
  island,
  position: (index ? [island[0] + 8.5, 0, island[2] + 15] : [0, 0, 0]) as V3,
}));

// These bounds include the shoreline rocks, jetty, and grounded beach lettering.
export const navigationObstacles = [
  { name: 'home reef', x: -1.8, z: -10.2, radius: 1.9 },
  ...ports.slice(1).flatMap(port => [
    { name: `${port.name} certificate island`, x: port.island[0]+certificateIslandOffset[0], z: port.island[2]+certificateIslandOffset[2], radius: certificateIslandRadius },
    { name: `${port.name} shore`, x: port.island[0], z: port.island[2], radius: 5.2 },
    { name: `${port.name} jetty`, x: port.island[0] - 2.65, z: port.island[2] + 4, radius: 1.9 },
    { name: `${port.name} title`, x: port.island[0] + shoreTitleOffset[0], z: port.island[2] + shoreTitleOffset[2], radius: 3.6 },
  ]),
];

export function createVoyageRoutes() {
  const heading = new T.Vector3(17, 0, -10.5).normalize();
  return ports.slice(0, -1).map((port, index) => {
    const a = new T.Vector3(...port.position), b = new T.Vector3(...ports[index + 1].position);
    const handle = a.distanceTo(b) * .34;
    // Shared dock headings keep adjacent legs smooth. The first leg bows out to sea.
    const departure = index ? a.clone().addScaledVector(heading, handle) : a.clone().add(new T.Vector3(6, 0, 16));
    const curve = new T.CubicBezierCurve3(a, departure, b.clone().addScaledVector(heading, -handle), b);
    curve.arcLengthDivisions = 2000;
    return curve;
  });
}
