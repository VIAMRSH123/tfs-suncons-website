import type { CSSProperties, ReactNode } from "react";
import { along, iso, tenth, toPoints } from "@/lib/iso";
import { Box, Cylinder, Ground, Windows, type Material } from "./IsoShapes";

/**
 * Vehicles and port machinery. None of them is branded: the fact sheet
 * confirms no fleet, so the gold load is the only thing that is "ours".
 */

type MovingProps = { run: number; seconds: number; delay?: number; children: ReactNode };

/** Loops its vehicle `run` world units down the route, fading in and out at each end (styles/journey.css). */
export function Moving({ run, seconds, delay = 0, children }: MovingProps) {
  const [dx, dy] = along(run);
  const style = {
    "--dx": `${dx}px`,
    "--dy": `${dy}px`,
    "--run": `${seconds}s`,
    "--delay": `${delay}s`,
  } as CSSProperties;
  return (
    <g className="journey-move" style={style}>
      {children}
    </g>
  );
}

/** Wheels on the near (+y) side, at `at` units along the vehicle. */
function Wheels({ x, y, at }: { x: number; y: number; at: readonly number[] }) {
  return (
    <g className="jwheel">
      {at.map((u) => {
        const [cx, cy] = iso(x + u, y, 0.17);
        return <ellipse key={u} cx={tenth(cx)} cy={tenth(cy)} rx={6} ry={7} />;
      })}
    </g>
  );
}

/** A rigid truck facing +x: load bed, cab and windscreen. */
export function Truck({ x, y, load = "gold" }: { x: number; y: number; load?: Material }) {
  const d = 0.86;
  const front = x + 3.3;
  return (
    <g>
      <Box x={x + 0.1} y={y} z={0.1} w={3.2} d={d} h={0.16} m="charcoal" />
      <Box x={x} y={y} z={0.26} w={2.25} d={d} h={0.88} m={load} />
      <Box x={x + 2.35} y={y} z={0.26} w={0.95} d={d} h={0.94} m="clay" />
      <polygon
        className="jglass"
        points={toPoints([iso(front, y + 0.1, 0.72), iso(front, y + d - 0.1, 0.72), iso(front, y + d - 0.1, 1.08), iso(front, y + 0.1, 1.08)])}
      />
      <polygon
        className="jglass"
        points={toPoints([iso(x + 2.5, y + d, 0.74), iso(x + 3.05, y + d, 0.74), iso(x + 3.05, y + d, 1.06), iso(x + 2.5, y + d, 1.06)])}
      />
      <Wheels x={x} y={y + d} at={[0.5, 1.75, 2.85]} />
    </g>
  );
}

/** A delivery van facing +x, with a band in the colour of the load it carries — gold for TFS's cargo. */
export function Van({ x, y, load = "gold" }: { x: number; y: number; load?: Material }) {
  const d = 0.72;
  const front = x + 1.75;
  return (
    <g>
      <Box x={x + 0.1} y={y} z={0.1} w={1.6} d={d} h={0.12} m="charcoal" />
      <Box x={x} y={y} z={0.22} w={1.25} d={d} h={0.74} m="clay" />
      <Box x={x + 1.25} y={y} z={0.22} w={0.5} d={d} h={0.56} m="clay" />
      <g className={`jm-${load}`}>
        <polygon
          className="r"
          points={toPoints([iso(x, y + d, 0.42), iso(x + 1.25, y + d, 0.42), iso(x + 1.25, y + d, 0.54), iso(x, y + d, 0.54)])}
        />
      </g>
      <polygon
        className="jglass"
        points={toPoints([iso(front, y + 0.08, 0.5), iso(front, y + d - 0.08, 0.5), iso(front, y + d - 0.08, 0.74), iso(front, y + 0.08, 0.74)])}
      />
      <Wheels x={x} y={y + d} at={[0.35, 1.45]} />
    </g>
  );
}

/** Deck cargo as [column, row (0 = far side), level, material], in painter's order. */
const DECK: readonly (readonly [number, number, number, Material])[] = [
  [0, 0, 0, "sand"],
  [0, 0, 1, "gold"],
  [1, 0, 0, "gold"],
  [1, 0, 1, "clay"],
  [2, 0, 0, "clay"],
  [2, 0, 1, "gold"],
  [3, 0, 0, "gold"],
  [0, 1, 0, "gold"],
  [0, 1, 1, "clay"],
  [1, 1, 0, "sand"],
  [1, 1, 1, "gold"],
  [2, 1, 0, "gold"],
  [2, 1, 1, "sand"],
  [3, 1, 0, "clay"],
];

/**
 * A small container ship sailing toward +x, with a wake on the water behind it.
 * Its gold containers are the cargo; `load` redraws them for a ship carrying something else.
 */
export function Ship({ x, y, load = "gold" }: { x: number; y: number; load?: Material }) {
  const w = 6.4;
  const d = 2;
  const hull = 0.78;
  const tip = x + w + 1.3;
  const middle = y + d / 2;
  return (
    <g>
      <Ground>
        <rect className="j-wake" x={x - 2.4} y={y + 0.2} width={2.4} height={0.2} />
        <rect className="j-wake" x={x - 1.5} y={y + d - 0.42} width={1.5} height={0.18} />
        <rect className="j-wake" x={x + w - 0.6} y={y + d + 0.08} width={1.6} height={0.12} />
      </Ground>
      <Box x={x} y={y} w={w} d={d} h={hull} m="forest" />
      <g className="jm-forest">
        <polygon className="l" points={toPoints([iso(x + w, y + d, 0), iso(tip, middle, 0), iso(tip, middle, hull), iso(x + w, y + d, hull)])} />
      </g>
      <g className="jm-concrete">
        <polygon
          className="t"
          points={toPoints([iso(x, y, hull), iso(x + w, y, hull), iso(tip, middle, hull), iso(x + w, y + d, hull), iso(x, y + d, hull)])}
        />
      </g>
      <polygon
        className="jstripe"
        points={toPoints([iso(x, y + d, 0.5), iso(x + w, y + d, 0.5), iso(tip, middle, 0.5), iso(tip, middle, 0.6), iso(x + w, y + d, 0.6), iso(x, y + d, 0.6)])}
      />
      <Box x={x + 0.2} y={y + 0.25} z={hull} w={1.1} d={d - 0.5} h={1.55} m="clay" />
      <Windows x={x + 0.2} y={y + 0.25} z={hull + 0.95} w={1.1} d={d - 0.5} h={0.42} face="left" cols={3} rows={1} fill={0.7} />
      <Windows x={x + 0.2} y={y + 0.25} z={hull + 0.95} w={1.1} d={d - 0.5} h={0.42} face="right" cols={3} rows={1} fill={0.7} />
      <Box x={x + 0.38} y={y + 0.72} z={hull + 1.55} w={0.42} d={0.56} h={0.55} m="forest" />
      <Box x={x + 0.38} y={y + 0.72} z={hull + 1.86} w={0.42} d={0.56} h={0.1} m="gold" />
      {DECK.map(([column, row, level, m]) => (
        <Box
          key={`${column}-${row}-${level}`}
          x={x + 1.6 + column * 1.2}
          y={y + 0.1 + row * 0.92}
          z={hull + level * 0.6}
          w={1.12}
          d={0.86}
          h={0.58}
          m={m === "gold" ? load : m}
        />
      ))}
    </g>
  );
}

const CRANE_HEIGHT = 4.1;

/**
 * A ship-to-shore crane: portal legs on the quay, a boom reaching `reach`
 * units over the water, and a gold container on the hook.
 */
export function Crane({ x, y, reach }: { x: number; y: number; reach: number }) {
  const boomStart = Math.min(x - 0.5, x + reach);
  const boomLength = Math.abs(reach) + 2.6;
  const hook = reach > 0 ? x + 2 + reach * 0.62 : x + reach * 0.82;
  const [cableX, cableTop] = iso(hook, y + 0.45, CRANE_HEIGHT);
  const [, cableBottom] = iso(hook, y + 0.45, 2.08);
  return (
    <g>
      <Box x={x} y={y} w={0.18} d={0.18} h={CRANE_HEIGHT} m="forest" />
      <Box x={x + 1.9} y={y} w={0.18} d={0.18} h={CRANE_HEIGHT} m="forest" />
      <Box x={x - 0.05} y={y} z={1.2} w={2.2} d={0.18} h={0.16} m="forest" />
      <Box x={x + 0.55} y={y + 0.05} z={CRANE_HEIGHT - 0.75} w={0.95} d={0.8} h={0.6} m="clay" />
      <line className="jcable" x1={tenth(cableX)} y1={tenth(cableTop)} x2={tenth(cableX)} y2={tenth(cableBottom)} />
      <Box x={hook - 0.55} y={y + 0.02} z={1.5} w={1.1} d={0.86} h={0.58} m="gold" />
      <Box x={x} y={y + 0.72} w={0.18} d={0.18} h={CRANE_HEIGHT} m="forest" />
      <Box x={x + 1.9} y={y + 0.72} w={0.18} d={0.18} h={CRANE_HEIGHT} m="forest" />
      <Box x={x - 0.05} y={y + 0.72} z={1.2} w={2.2} d={0.18} h={0.16} m="forest" />
      <Box x={boomStart} y={y + 0.2} z={CRANE_HEIGHT} w={boomLength} d={0.5} h={0.28} m="forest" />
    </g>
  );
}

/** A channel buoy marking the shipping lane. */
export function Buoy({ x, y }: { x: number; y: number }) {
  return <Cylinder x={x} y={y} r={0.16} h={0.32} m="gold" cap="cone" />;
}
