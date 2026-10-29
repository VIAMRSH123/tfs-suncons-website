import { UNIT, iso, tenth } from "@/lib/iso";
import {
  Box,
  ContainerYard,
  Cylinder,
  FacePanel,
  Pallet,
  Palm,
  RoundShadow,
  Shadow,
  Windows,
  YardShadows,
  type Layer,
  type StackSpot,
} from "./IsoShapes";
import { Crane } from "./Vehicles";

/**
 * The Qatar side: a quay where the cargo comes ashore, then Doha — towers
 * behind the road, and in front of it the kind of buyers the company names:
 * a hotel, a restaurant, a supermarket. None of them stands for a real business.
 */

type SceneProps = { layer: Layer };
type Spot = readonly [number, number];

const DOHA_BACK: readonly StackSpot[] = [
  [68.95, -5.6, ["gold", "sand"]],
  [68.95, -3.5, ["clay", "gold"]],
  [68.95, -1.4, ["gold"]],
];

const DOHA_FRONT: readonly StackSpot[] = [
  [68.95, 7.2, ["sand", "gold"]],
  [68.95, 9.3, ["gold"]],
];

export function DohaPortScene({ layer }: SceneProps) {
  if (layer === "ground") {
    return (
      <>
        <rect className="jg-paint" x={66.4} y={4.98} width={3.7} height={0.07} />
        <rect className="jg-paint" x={66.4} y={6.95} width={3.7} height={0.07} />
        <YardShadows stacks={[...DOHA_BACK, ...DOHA_FRONT]} />
        <Shadow x={66.7} y={1.7} w={2.1} d={0.9} h={1.5} />
      </>
    );
  }
  if (layer === "back") {
    return (
      <>
        <ContainerYard stacks={DOHA_BACK} />
        <Crane x={66.7} y={1.7} reach={-4.4} />
      </>
    );
  }
  return <ContainerYard stacks={DOHA_FRONT} />;
}

type TowerProps = { x: number; y: number; w: number; d: number; h: number; m: "clay" | "glass"; cols: Spot; rows: number };

function Tower({ x, y, w, d, h, m, cols, rows }: TowerProps) {
  return (
    <g>
      <Box x={x} y={y} w={w} d={d} h={h} m={m} />
      <Windows x={x} y={y} z={0.4} w={w} d={d} h={h - 0.7} face="left" cols={cols[0]} rows={rows} />
      <Windows x={x} y={y} z={0.4} w={w} d={d} h={h - 0.7} face="right" cols={cols[1]} rows={rows} />
      <Box x={x - 0.05} y={y - 0.05} z={h} w={w + 0.1} d={d + 0.1} h={0.16} m="forest" />
    </g>
  );
}

/** Bands round a round tower, where the glass is broken by its frame. */
function TowerBands({ x, y, r, levels }: { x: number; y: number; r: number; levels: readonly number[] }) {
  const rx = r * UNIT * Math.SQRT2;
  const ry = rx / 2;
  const d = levels
    .map((z) => {
      const [cx, cy] = iso(x, y, z);
      return `M${tenth(cx - rx)},${tenth(cy)}A${tenth(rx)},${tenth(ry)} 0 0 0 ${tenth(cx + rx)},${tenth(cy)}`;
    })
    .join("");
  return <path className="jband" d={d} />;
}

function Hotel({ x, y }: { x: number; y: number }) {
  const w = 2.8;
  const d = 2.6;
  const h = 4.4;
  return (
    <g>
      <Box x={x} y={y} w={w} d={d} h={h} m="clay" />
      <Windows x={x} y={y} z={1.1} w={w} d={d} h={3} face="left" cols={4} rows={6} />
      <Windows x={x} y={y} z={1.1} w={w} d={d} h={3} face="right" cols={3} rows={6} />
      <FacePanel x={x} y={y + d} u={0.95} v={0} width={0.9} height={0.75} />
      <Box x={x + 0.7} y={y + d} z={0.85} w={1.4} d={0.5} h={0.12} m="gold" />
      <Box x={x - 0.05} y={y - 0.05} z={h} w={w + 0.1} d={d + 0.1} h={0.16} m="forest" />
    </g>
  );
}

function Restaurant({ x, y }: { x: number; y: number }) {
  const w = 2.4;
  const d = 2;
  const h = 1.25;
  return (
    <g>
      <Box x={x} y={y} w={w} d={d} h={h} m="clay" />
      <Windows x={x} y={y} z={0.22} w={w} d={d} h={0.5} face="left" cols={3} rows={1} fill={0.7} />
      <Box x={x + 0.1} y={y + d} z={0.82} w={w - 0.2} d={0.55} h={0.12} m="gold" />
      <Box x={x - 0.04} y={y - 0.04} z={h} w={w + 0.08} d={d + 0.08} h={0.12} m="forest" />
    </g>
  );
}

function Supermarket({ x, y }: { x: number; y: number }) {
  const w = 3.4;
  const d = 2.6;
  const h = 1.4;
  return (
    <g>
      <Box x={x} y={y} w={w} d={d} h={h} m="clay" />
      <Windows x={x} y={y} z={0.18} w={w} d={d} h={0.62} face="left" cols={5} rows={1} fill={0.72} />
      <FacePanel x={x} y={y + d} u={0} v={1} width={w} height={0.24} tone="band" />
      <Box x={x - 0.04} y={y - 0.04} z={h} w={w + 0.08} d={d + 0.08} h={0.12} m="forest" />
    </g>
  );
}

const PALMS_BACK: readonly Spot[] = [
  [74.4, 4.4],
  [80.4, 4.4],
  [83.6, 3],
];

const PALMS_FRONT: readonly Spot[] = [
  [74.7, 8.6],
  [78.2, 8.6],
  [82.6, 8.6],
];

function PalmShadows({ palms }: { palms: readonly Spot[] }) {
  return palms.map(([x, y]) => <RoundShadow key={`${x},${y}`} x={x} y={y} r={0.55} />);
}

export function CityScene({ layer }: SceneProps) {
  if (layer === "ground") {
    return (
      <>
        <rect className="jg-yard" x={70.6} y={-3.8} width={15} height={8.7} />
        <rect className="jg-yard" x={70.6} y={7.1} width={15} height={6.5} />
        <Shadow x={71.2} y={-2.4} w={2.2} d={2.2} h={5.4} />
        <Shadow x={72.4} y={1.4} w={3} d={2.6} h={1.3} />
        <Shadow x={75.55} y={-1.25} w={2.1} d={2.1} h={6} />
        <Shadow x={78.6} y={-2.6} w={2} d={2} h={4.6} />
        <Shadow x={82} y={-3.2} w={1.8} d={1.8} h={3.2} />
        <Shadow x={71.4} y={8.2} w={2.8} d={2.6} h={4.4} />
        <Shadow x={75.4} y={8.4} w={2.4} d={2} h={1.3} />
        <Shadow x={78.8} y={8.2} w={3.4} d={2.6} h={1.4} />
        <PalmShadows palms={PALMS_BACK} />
        <PalmShadows palms={PALMS_FRONT} />
      </>
    );
  }
  if (layer === "back") {
    return (
      <>
        <Tower x={71.2} y={-2.4} w={2.2} d={2.2} h={5.2} m="clay" cols={[3, 3]} rows={8} />
        <Box x={72.4} y={1.4} w={3} d={2.6} h={1.25} m="clay" />
        <Windows x={72.4} y={1.4} z={0.25} w={3} d={2.6} h={0.6} face="left" cols={5} rows={1} fill={0.7} />
        <Box x={72.36} y={1.36} z={1.25} w={3.08} d={2.68} h={0.12} m="forest" />
        <Tower x={78.6} y={-2.6} w={2} d={2} h={4.6} m="glass" cols={[2, 2]} rows={7} />
        <Cylinder x={76.6} y={-0.2} r={1.05} h={7.4} m="glass" cap="dome" />
        <TowerBands x={76.6} y={-0.2} r={1.05} levels={[1.4, 2.8, 4.2, 5.6, 6.8]} />
        <Tower x={82} y={-3.2} w={1.8} d={1.8} h={3.2} m="clay" cols={[2, 2]} rows={5} />
        {PALMS_BACK.map(([x, y]) => (
          <Palm key={`${x},${y}`} x={x} y={y} />
        ))}
      </>
    );
  }
  return (
    <>
      <Hotel x={71.4} y={8.2} />
      <Palm x={PALMS_FRONT[0][0]} y={PALMS_FRONT[0][1]} />
      <Restaurant x={75.4} y={8.4} />
      <Palm x={PALMS_FRONT[1][0]} y={PALMS_FRONT[1][1]} />
      <Supermarket x={78.8} y={8.2} />
      <Pallet x={76.1} y={11.05} layers={2} />
      <Palm x={PALMS_FRONT[2][0]} y={PALMS_FRONT[2][1]} />
    </>
  );
}
