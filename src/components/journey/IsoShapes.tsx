import type { ReactNode } from "react";
import { GROUND_MATRIX, UNIT, boxFaces, iso, tenth, toPoints, type ScreenPoint } from "@/lib/iso";

/**
 * The journey diorama's building blocks: plain server-rendered SVG, coloured
 * by material classes in styles/journey.css so the markup stays small.
 */

/** Each material class fills the top (t), left/+y (l) and right/+x (r) faces — and the underside (b) on trees. */
export type Material =
  | "clay"
  | "concrete"
  | "sand"
  | "gold"
  | "wood"
  | "forest"
  | "leaf"
  | "pine"
  | "charcoal"
  | "glass";

/** Which pass a scene draws: the ground, things behind the road, or things in front of it. */
export type Layer = "ground" | "back" | "front";

/** A box by its back corner (x, y, z) and its size along each axis. */
export type Footprint = { x: number; y: number; z?: number; w: number; d: number; h: number };

/** World units are small numbers; two decimals is exact enough and keeps floats short. */
const hundredth = (n: number): number => Math.round(n * 100) / 100;

const asPath = (points: readonly ScreenPoint[]): string => `M${toPoints(points).split(" ").join("L")}Z`;

type BoxProps = Footprint & { m: Material };

export function Box({ x, y, z = 0, w, d, h, m }: BoxProps) {
  const faces = boxFaces(x, y, z, w, d, h);
  return (
    <g className={`jm-${m}`}>
      <polygon className="l" points={faces.left} />
      <polygon className="r" points={faces.right} />
      <polygon className="t" points={faces.top} />
    </g>
  );
}

/** Flat shapes in world units, laid on the ground plane. */
export function Ground({ children }: { children: ReactNode }) {
  return <g transform={GROUND_MATRIX}>{children}</g>;
}

/** A contact shadow cast toward +x, so the light reads as coming from the upper left. Inside <Ground>. */
export function Shadow({ x, y, w, d, h }: Footprint) {
  return (
    <rect
      className="j-shadow"
      x={hundredth(x)}
      y={hundredth(y)}
      width={hundredth(w + h * 0.45)}
      height={hundredth(d + h * 0.1)}
    />
  );
}

/** A round shadow for trees, palms and silos. Inside <Ground>. */
export function RoundShadow({ x, y, r }: { x: number; y: number; r: number }) {
  return <ellipse className="j-shadow" cx={hundredth(x + r * 0.5)} cy={hundredth(y)} rx={r} ry={hundredth(r * 0.8)} />;
}

/** A pitched roof with its ridge along x, steep enough that the back slope stays hidden. */
export function GableRoof({ x, y, z = 0, w, d, h, m }: BoxProps) {
  const ridge = y + d / 2;
  const slope = [iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, ridge, z + h), iso(x, ridge, z + h)];
  const gable = [iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, ridge, z + h)];
  return (
    <g className={`jm-${m}`}>
      <polygon className="t" points={toPoints(slope)} />
      <polygon className="r" points={toPoints(gable)} />
    </g>
  );
}

type WindowsProps = Footprint & { face: "left" | "right"; cols: number; rows: number; fill?: number };

/** A grid of windows on one face of a box — one path, however many windows. */
export function Windows({ x, y, z = 0, w, d, h, face, cols, rows, fill = 0.55 }: WindowsProps) {
  const span = face === "left" ? w : d;
  const at = (u: number, v: number): ScreenPoint =>
    face === "left" ? iso(x + u, y + d, z + v) : iso(x + w, y + u, z + v);
  const cellU = span / cols;
  const cellV = h / rows;
  const padU = (cellU * (1 - fill)) / 2;
  const padV = (cellV * (1 - fill)) / 2;
  const quads = Array.from({ length: cols * rows }, (_, i) => {
    const u0 = Math.floor(i / rows) * cellU + padU;
    const v0 = (i % rows) * cellV + padV;
    const u1 = u0 + cellU - 2 * padU;
    const v1 = v0 + cellV - 2 * padV;
    return asPath([at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)]);
  });
  return <path className={`jw-${face}`} d={quads.join("")} />;
}

type PanelProps = { x: number; y: number; z?: number; u: number; v: number; width: number; height: number; tone?: "door" | "band" };

/**
 * A flat panel on a left (+y) face whose plane is `y`: a door, or a gold band
 * where a shop would carry its sign. `u` runs along the face, `v` up from `z`.
 */
export function FacePanel({ x, y, z = 0, u, v, width, height, tone = "door" }: PanelProps) {
  const at = (du: number, dv: number) => iso(x + u + du, y, z + v + dv);
  return (
    <path
      className={tone === "door" ? "jdoor" : "jstripe"}
      d={asPath([at(0, 0), at(width, 0), at(width, height), at(0, height)])}
    />
  );
}

type TreeProps = { x: number; y: number; s?: number; m?: "leaf" | "pine" };

/** A low-poly tree: a faceted crown on a short trunk. */
export function Tree({ x, y, s = 1, m = "leaf" }: TreeProps) {
  const trunk = 0.4 * s;
  const radius = 0.5 * s;
  const half = 0.6 * s;
  const middle = trunk + half;
  const top = iso(x, y, middle + half);
  const bottom = iso(x, y, middle - half);
  const xPlus = iso(x + radius, y, middle);
  const yPlus = iso(x, y + radius, middle);
  const xMinus = iso(x - radius, y, middle);
  const yMinus = iso(x, y - radius, middle);
  return (
    <g>
      <Box x={x - 0.06 * s} y={y - 0.06 * s} w={0.12 * s} d={0.12 * s} h={trunk + 0.2 * s} m="wood" />
      <g className={`jm-${m}`}>
        <polygon className="t" points={toPoints([top, xMinus, yPlus])} />
        <polygon className="r" points={toPoints([top, yMinus, xPlus])} />
        <polygon className="l" points={toPoints([top, yPlus, xPlus])} />
        <polygon className="b" points={toPoints([bottom, yPlus, xPlus])} />
      </g>
    </g>
  );
}

const FROND_ANGLES = [-165, -120, -75, -30, 15, 60, 105, 150];

/** A date palm: a tall trunk and drooping fronds. */
export function Palm({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const height = 1.9 * s;
  const [cx, cy] = iso(x, y, height);
  const length = 0.95 * s * UNIT;
  const fronds = FROND_ANGLES.map((degrees) => {
    const angle = (degrees * Math.PI) / 180;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle) * 0.5;
    const spread = length * 0.14;
    const midX = cx + dx * length * 0.5;
    const midY = cy + dy * length * 0.5;
    const tip: ScreenPoint = [cx + dx * length, cy + dy * length + length * 0.3];
    return toPoints([[cx, cy], [midX - dy * spread * 2, midY + dx * spread], tip, [midX + dy * spread * 2, midY - dx * spread]]);
  });
  return (
    <g>
      <Box x={x - 0.05 * s} y={y - 0.05 * s} w={0.1 * s} d={0.1 * s} h={height} m="wood" />
      <g className="jm-leaf">
        {fronds.map((points, i) => (
          <polygon key={FROND_ANGLES[i]} className={i % 2 === 0 ? "l" : "r"} points={points} />
        ))}
      </g>
    </g>
  );
}

type CylinderProps = {
  x: number;
  y: number;
  z?: number;
  r: number;
  h: number;
  m: "clay" | "glass" | "gold";
  cap?: "flat" | "cone" | "dome";
};

/** An upright cylinder — silos, towers, buoys — shaded by a gradient defined in the world's <defs>. */
export function Cylinder({ x, y, z = 0, r, h, m, cap = "flat" }: CylinderProps) {
  const [cx, base] = iso(x, y, z);
  const top = base - h * UNIT;
  const rx = r * UNIT * Math.SQRT2;
  const ry = rx / 2;
  const left = tenth(cx - rx);
  const right = tenth(cx + rx);
  const body = `M${left},${tenth(top)}V${tenth(base)}A${tenth(rx)},${tenth(ry)} 0 0 0 ${right},${tenth(base)}V${tenth(top)}Z`;
  const peak = top - rx * 0.6;
  return (
    <g className={`jm-${m}`}>
      <path d={body} fill={`url(#jcyl-${m})`} />
      {cap === "flat" ? <ellipse className="t" cx={tenth(cx)} cy={tenth(top)} rx={tenth(rx)} ry={tenth(ry)} /> : null}
      {cap === "cone" ? (
        <>
          <polygon className="l" points={toPoints([[cx - rx, top], [cx, peak], [cx, top + ry]])} />
          <polygon className="r" points={toPoints([[cx, top + ry], [cx, peak], [cx + rx, top]])} />
        </>
      ) : null}
      {cap === "dome" ? (
        <path
          d={`M${left},${tenth(top)}A${tenth(rx)},${tenth(rx * 0.85)} 0 0 1 ${right},${tenth(top)}A${tenth(rx)},${tenth(ry)} 0 0 1 ${left},${tenth(top)}Z`}
          fill={`url(#jcyl-${m})`}
        />
      ) : null}
    </g>
  );
}

/** A pallet of sacks — the cargo the journey follows. */
export function Pallet({ x, y, layers = 3 }: { x: number; y: number; layers?: number }) {
  return (
    <g>
      <Box x={x} y={y} w={0.9} d={0.72} h={0.1} m="wood" />
      {Array.from({ length: layers }, (_, layer) => (
        <Box
          key={layer}
          x={x + (layer % 2 === 0 ? 0.02 : 0.06)}
          y={y + 0.03}
          z={0.1 + layer * 0.19}
          w={0.82}
          d={0.66}
          h={0.18}
          m="gold"
        />
      ))}
    </g>
  );
}

/** A container stack on a quay: [x, y, materials bottom to top]. */
export type StackSpot = readonly [number, number, readonly Material[]];

/** Container stacks lying along y, drawn in the order given (back to front). */
export function ContainerYard({ stacks }: { stacks: readonly StackSpot[] }) {
  return stacks.map(([x, y, stack]) => (
    <g key={`${x},${y}`}>
      {stack.map((m, level) => (
        <Box key={level} x={x} y={y} z={level * 0.82} w={0.92} d={1.95} h={0.8} m={m} />
      ))}
    </g>
  ));
}

/** The container stacks' contact shadows. Inside <Ground>. */
export function YardShadows({ stacks }: { stacks: readonly StackSpot[] }) {
  return stacks.map(([x, y, stack]) => (
    <Shadow key={`${x},${y}`} x={x} y={y} w={0.92} d={1.95} h={stack.length * 0.82} />
  ));
}
