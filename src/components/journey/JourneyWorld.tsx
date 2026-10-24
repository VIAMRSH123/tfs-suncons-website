import { iso, seeded } from "@/lib/iso";
import { Cargo } from "./Cargo";
import { ROUTE_Y, WORLD } from "./chapters";
import { FieldScene, IndiaPortScene, MillScene, PackedScene } from "./IndiaScenes";
import { Ground, type Layer } from "./IsoShapes";
import { CityScene, DohaPortScene } from "./QatarScenes";
import { Moving, Ship, Truck, Van } from "./Vehicles";

/**
 * The whole journey as one isometric world, field to Doha, drawn once on the
 * server. The land is the page's own ivory; the camera (JourneyStage) moves
 * the finished SVG and slides the gold cargo along it, so nothing here
 * re-renders.
 */

const SCENES = [
  ["field", FieldScene],
  ["mill", MillScene],
  ["packed", PackedScene],
  ["india-port", IndiaPortScene],
  ["doha-port", DohaPortScene],
  ["city", CityScene],
] as const;

function SceneLayer({ layer }: { layer: Layer }) {
  return SCENES.map(([id, Scene]) => <Scene key={id} layer={layer} />);
}

/** One tile of faceted water: 3 × 3 cells of two triangles, each a shade picked once, deterministically. */
const random = seeded(91);
const SEA_FACETS = Array.from({ length: 18 }, (_, i) => {
  const cell = Math.floor(i / 2);
  const x = (cell % 3) * 2;
  const y = Math.floor(cell / 3) * 2;
  const points = i % 2 === 0 ? `${x},${y} ${x + 2},${y} ${x + 2},${y + 2}` : `${x},${y} ${x + 2},${y + 2} ${x},${y + 2}`;
  return { points, shade: 1 + Math.floor(random() * 4) };
});

function WorldDefs() {
  return (
    <defs>
      <pattern id="jpat-paddy" width="1" height="0.44" patternUnits="userSpaceOnUse">
        <rect className="jp-paddy-a" width="1" height="0.44" />
        <rect className="jp-paddy-b" y="0.3" width="1" height="0.14" />
      </pattern>
      <pattern id="jpat-ripe" width="1" height="0.44" patternUnits="userSpaceOnUse">
        <rect className="jp-ripe-a" width="1" height="0.44" />
        <rect className="jp-ripe-b" y="0.3" width="1" height="0.14" />
      </pattern>
      <pattern id="jpat-sea" width="6" height="6" patternUnits="userSpaceOnUse">
        {SEA_FACETS.map(({ points, shade }) => (
          <polygon key={points} className={`jp-sea-${shade}`} points={points} />
        ))}
      </pattern>
      {(["clay", "glass", "gold"] as const).map((m) => (
        <linearGradient key={m} id={`jcyl-${m}`}>
          <stop offset="0" className={`js-${m}-a`} />
          <stop offset="0.6" className={`js-${m}-b`} />
          <stop offset="1" className={`js-${m}-c`} />
        </linearGradient>
      ))}
    </defs>
  );
}

/** Sea, canal, quays and roads — in world units, under <Ground>. The road covers the canal: a bridge. */
function WorldBase() {
  return (
    <>
      <rect x={46} y={-40} width={20.25} height={90} fill="url(#jpat-sea)" />
      <rect className="jg-water" x={12.3} y={-40} width={0.6} height={90} />
      <rect className="jg-quay" x={38} y={-40} width={7.75} height={90} />
      <rect className="jg-quay" x={66.25} y={-40} width={3.9} height={90} />
      <rect className="jg-road" x={-16} y={5.3} width={61.75} height={1.4} />
      <rect className="jg-road" x={66.25} y={5.3} width={40} height={1.4} />
      <rect className="jg-curb" x={45.6} y={-40} width={0.15} height={90} />
      <rect className="jg-curb" x={66.25} y={-40} width={0.15} height={90} />
    </>
  );
}

/** The trade route: one gold dashed line from the field, across the sea, into Doha. */
function RouteLine() {
  const [x1, y1] = iso(-16, ROUTE_Y);
  const [x2, y2] = iso(100, ROUTE_Y);
  return <line className="journey-route" x1={x1} y1={y1} x2={x2} y2={y2} />;
}

/**
 * Ambient traffic: each vehicle loops one stretch of the route, the delays
 * keeping them out of step, and none of them carries gold. They share the one
 * lane with the cargo, so they stand in for it only where it is hidden — under
 * reduced motion (styles/journey.css).
 */
function Traffic() {
  return (
    <g className="journey-traffic">
      <Moving run={11} seconds={8}>
        <Truck x={3.2} y={5.52} load="sand" />
      </Moving>
      <Moving run={9.4} seconds={8} delay={-4}>
        <Truck x={30.9} y={5.52} load="clay" />
      </Moving>
      <Moving run={10.4} seconds={16} delay={-3}>
        <Ship x={46.4} y={5} load="sand" />
      </Moving>
      <Moving run={10} seconds={7} delay={-2}>
        <Van x={67.4} y={5.6} load="sand" />
      </Moving>
    </g>
  );
}

export function JourneyWorld() {
  const [ox, oy] = WORLD.origin;
  return (
    <svg
      className="journey-world"
      viewBox={`0 0 ${WORLD.width} ${WORLD.height}`}
      aria-hidden="true"
      focusable="false"
    >
      <WorldDefs />
      <g transform={`translate(${ox} ${oy})`}>
        <Ground>
          <WorldBase />
          <SceneLayer layer="ground" />
        </Ground>
        <RouteLine />
        <SceneLayer layer="back" />
        <Traffic />
        <Cargo />
        <SceneLayer layer="front" />
      </g>
    </svg>
  );
}
