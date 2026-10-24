import {
  Box,
  ContainerYard,
  Cylinder,
  FacePanel,
  GableRoof,
  Pallet,
  RoundShadow,
  Shadow,
  Tree,
  Windows,
  YardShadows,
  type Layer,
  type StackSpot,
} from "./IsoShapes";
import { Buoy, Crane, Truck } from "./Vehicles";

/**
 * The India side of the journey, field to quay. Each scene draws one layer at
 * a time — ground, then what stands behind the road, then what stands in front
 * of it — so the vehicles on the road slot between the two.
 */

type SceneProps = { layer: Layer };
type TreeSpot = readonly [number, number, "leaf" | "pine"];

/** Paddy plots as [x, y, w, d, ripe]; the gaps between them are the bunds. */
const PADDY: readonly (readonly [number, number, number, number, boolean])[] = [
  [-9, -6, 7.4, 5.4, false],
  [-1.2, -6, 6.2, 5.4, true],
  [5.2, -6, 6.6, 5.4, false],
  [-9, -0.4, 7.4, 5.3, true],
  [-1.2, -0.4, 6.2, 5.3, false],
  [5.2, -0.4, 6.6, 5.3, true],
  [-9, 7, 7.4, 5.2, false],
  [-1.2, 7, 6.2, 5.2, true],
  [5.2, 7, 6.6, 3.2, false],
  [-9, 12.4, 7.4, 5, true],
  [-1.2, 12.4, 6.2, 5, false],
];

const FIELD_TREES: readonly TreeSpot[] = [
  [-8.2, -6.9, "pine"],
  [-4.6, -6.8, "leaf"],
  [-0.6, -6.9, "pine"],
  [3.2, -6.8, "leaf"],
  [6.8, -6.9, "pine"],
  [10.4, -6.8, "leaf"],
  [11.6, 1.2, "leaf"],
  [11.9, 3.7, "pine"],
];

const FIELD_TREES_FRONT: readonly TreeSpot[] = [
  [-9.7, 7.5, "leaf"],
  [4.7, 7.6, "pine"],
  [-2.2, 18.2, "leaf"],
  [11.5, 7.5, "leaf"],
  [3.5, 18, "pine"],
  [12, 13.8, "pine"],
];

function TreeShadows({ trees }: { trees: readonly TreeSpot[] }) {
  return trees.map(([x, y]) => <RoundShadow key={`${x},${y}`} x={x} y={y} r={0.5} />);
}

function Trees({ trees }: { trees: readonly TreeSpot[] }) {
  return trees.map(([x, y, m]) => <Tree key={`${x},${y}`} x={x} y={y} m={m} />);
}

function Farmhouse({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Box x={x} y={y} w={2.6} d={1.8} h={1.05} m="clay" />
      <Windows x={x} y={y} z={0.35} w={1.8} d={1.8} h={0.45} face="left" cols={2} rows={1} />
      <FacePanel x={x} y={y + 1.8} u={1.95} v={0} width={0.42} height={0.7} />
      <GableRoof x={x} y={y} z={1.05} w={2.6} d={1.8} h={0.82} m="forest" />
    </g>
  );
}

export function FieldScene({ layer }: SceneProps) {
  if (layer === "ground") {
    return (
      <>
        {PADDY.map(([x, y, w, d, isRipe]) => (
          <rect key={`${x},${y}`} x={x} y={y} width={w} height={d} fill={isRipe ? "url(#jpat-ripe)" : "url(#jpat-paddy)"} />
        ))}
        <Shadow x={6.6} y={11.2} w={2.6} d={1.8} h={1.6} />
        <Shadow x={9.8} y={11.6} w={1.4} d={1.2} h={1.1} />
        <Shadow x={8.3} y={4.35} w={1.95} d={0.72} h={0.7} />
        <TreeShadows trees={FIELD_TREES} />
        <TreeShadows trees={FIELD_TREES_FRONT} />
      </>
    );
  }
  if (layer === "back") {
    return (
      <>
        <Trees trees={FIELD_TREES} />
        <Pallet x={8.3} y={4.35} />
        <Pallet x={9.35} y={4.35} layers={2} />
      </>
    );
  }
  return (
    <>
      <Trees trees={FIELD_TREES_FRONT.slice(0, 3)} />
      <Farmhouse x={6.6} y={11.2} />
      <Trees trees={FIELD_TREES_FRONT.slice(3, 4)} />
      <Box x={9.8} y={11.6} w={1.4} d={1.2} h={0.8} m="sand" />
      <GableRoof x={9.8} y={11.6} z={0.8} w={1.4} d={1.2} h={0.55} m="forest" />
      <Trees trees={FIELD_TREES_FRONT.slice(4)} />
    </>
  );
}

const SILOS = [
  [22.8, 1.25],
  [24.75, 1.25],
  [22.8, 3.3],
] as const;

const MILL_TREES: readonly TreeSpot[] = [
  [22.2, 7.5, "pine"],
  [13.4, 11.2, "leaf"],
  [24.2, 8.6, "leaf"],
  [20.5, 12, "pine"],
];

export function MillScene({ layer }: SceneProps) {
  if (layer === "ground") {
    return (
      <>
        <rect className="jg-yard" x={13.6} y={-2} width={11} height={7.1} />
        <rect className="jg-yard" x={14} y={6.9} width={7.4} height={3.8} />
        <Shadow x={14.4} y={-0.6} w={5.4} d={3.4} h={3.4} />
        <Shadow x={20.3} y={0.5} w={1.1} d={1.1} h={4.9} />
        {SILOS.map(([x, y]) => (
          <RoundShadow key={`${x},${y}`} x={x} y={y} r={0.95} />
        ))}
        <Shadow x={15} y={7.3} w={3} d={1.7} h={0.7} />
        <Shadow x={18.4} y={8.4} w={3.3} d={0.86} h={1.2} />
        <TreeShadows trees={MILL_TREES} />
      </>
    );
  }
  if (layer === "back") {
    return (
      <>
        <Box x={14.4} y={-0.6} w={5.4} d={3.4} h={2.3} m="clay" />
        <Windows x={14.4} y={-0.6} z={0.55} w={5.4} d={3.4} h={1.5} face="left" cols={6} rows={2} />
        <Windows x={14.4} y={-0.6} z={0.55} w={5.4} d={3.4} h={1.5} face="right" cols={3} rows={2} />
        <FacePanel x={14.4} y={2.8} u={3.9} v={0} width={0.9} height={1.25} />
        <GableRoof x={14.4} y={-0.6} z={2.3} w={5.4} d={3.4} h={1.1} m="forest" />
        <Box x={20.3} y={0.5} w={1.1} d={1.1} h={4.7} m="clay" />
        <Windows x={20.3} y={0.5} z={0.6} w={1.1} d={1.1} h={3.6} face="right" cols={1} rows={4} />
        <Box x={20.2} y={0.4} z={4.7} w={1.3} d={1.3} h={0.28} m="forest" />
        <Box x={21.4} y={0.85} z={3.85} w={1} d={0.36} h={0.28} m="forest" />
        {SILOS.map(([x, y]) => (
          <Cylinder key={`${x},${y}`} x={x} y={y} r={0.82} h={3.5} m="clay" cap="cone" />
        ))}
      </>
    );
  }
  return (
    <>
      <Pallet x={15} y={7.3} />
      <Pallet x={15} y={8.25} layers={2} />
      <Pallet x={16.05} y={7.3} />
      <Pallet x={17.1} y={7.3} layers={2} />
      <Trees trees={MILL_TREES.slice(0, 1)} />
      <Truck x={18.4} y={8.4} load="sand" />
      <Trees trees={MILL_TREES.slice(1)} />
    </>
  );
}

/** Pallets in the yard, in front of the packing hall's loading door. */
const YARD_PALLETS = [
  [27.3, 2.7],
  [28.4, 2.7],
  [29.5, 2.7],
  [30.6, 2.7],
  [31.7, 2.7],
  [27.3, 3.85],
  [28.4, 3.85],
  [29.5, 3.85],
  [30.6, 3.85],
] as const;

const PACKED_TREES: readonly TreeSpot[] = [
  [36.4, 8.1, "leaf"],
  [26, 11.6, "pine"],
  [32.4, 12.1, "leaf"],
];

export function PackedScene({ layer }: SceneProps) {
  if (layer === "ground") {
    return (
      <>
        <rect className="jg-yard" x={26.3} y={-2.2} width={10.4} height={7.3} />
        <rect className="jg-yard" x={26.4} y={6.9} width={9.4} height={4.2} />
        <Shadow x={26.9} y={-1.7} w={6.2} d={3.9} h={3.2} />
        <Shadow x={34} y={-1.4} w={2.2} d={2.6} h={1.7} />
        <Shadow x={27.3} y={2.7} w={5.3} d={1.9} h={0.7} />
        <Shadow x={29.4} y={8.1} w={1.9} d={0.72} h={1.3} />
        <Shadow x={34.6} y={7.6} w={0.9} d={0.72} h={0.5} />
        <TreeShadows trees={PACKED_TREES} />
      </>
    );
  }
  if (layer === "back") {
    return (
      <>
        <Box x={26.9} y={-1.7} w={6.2} d={3.9} h={2.2} m="clay" />
        <Windows x={26.9} y={-1.7} z={1.3} w={6.2} d={3.9} h={0.6} face="left" cols={7} rows={1} />
        <Windows x={26.9} y={-1.7} z={1.3} w={6.2} d={3.9} h={0.6} face="right" cols={4} rows={1} />
        <FacePanel x={26.9} y={2.2} u={2.4} v={0} width={1.6} height={1.15} />
        <GableRoof x={26.9} y={-1.7} z={2.2} w={6.2} d={3.9} h={1} m="forest" />
        <Box x={34} y={-1.4} w={2.2} d={2.6} h={1.6} m="clay" />
        <Windows x={34} y={-1.4} z={0.5} w={2.2} d={2.6} h={0.7} face="left" cols={3} rows={1} />
        <Windows x={34} y={-1.4} z={0.5} w={2.2} d={2.6} h={0.7} face="right" cols={3} rows={1} />
        <Box x={33.95} y={-1.45} z={1.6} w={2.3} d={2.7} h={0.14} m="forest" />
        {YARD_PALLETS.map(([x, y], i) => (
          <Pallet key={`${x},${y}`} x={x} y={y} layers={i % 3 === 1 ? 2 : 3} />
        ))}
      </>
    );
  }
  return (
    <>
      <Box x={29.4} y={8.2} z={0.12} w={0.85} d={0.62} h={0.5} m="gold" />
      <Box x={29.45} y={8.25} z={0.62} w={0.5} d={0.52} h={0.5} m="charcoal" />
      <Box x={30.27} y={8.24} w={0.08} d={0.54} h={1.3} m="charcoal" />
      <Pallet x={30.4} y={8.1} layers={2} />
      <Box x={34.6} y={7.6} w={0.9} d={0.72} h={0.5} m="wood" />
      <Trees trees={PACKED_TREES} />
    </>
  );
}

const PORT_BACK: readonly StackSpot[] = [
  [38.5, -3.5, ["sand", "clay", "gold"]],
  [39.55, -3.5, ["forest", "gold"]],
  [38.5, -1.4, ["gold", "sand"]],
  [39.55, -1.4, ["clay"]],
  [38.5, 0.7, ["clay", "gold", "forest"]],
  [39.55, 0.7, ["gold", "sand"]],
  [38.5, 2.8, ["sand"]],
  [39.55, 2.8, ["gold", "clay"]],
];

const PORT_FRONT: readonly StackSpot[] = [
  [38.5, 7.2, ["gold", "sand"]],
  [39.55, 7.2, ["clay"]],
  [38.5, 9.3, ["sand", "gold", "clay"]],
  [39.55, 9.3, ["gold"]],
  [38.5, 11.4, ["forest", "gold"]],
  [39.55, 11.4, ["sand", "clay"]],
];

export function IndiaPortScene({ layer }: SceneProps) {
  if (layer === "ground") {
    return (
      <>
        <rect className="jg-paint" x={38} y={4.98} width={7.6} height={0.07} />
        <rect className="jg-paint" x={38} y={6.95} width={7.6} height={0.07} />
        <YardShadows stacks={[...PORT_BACK, ...PORT_FRONT]} />
        <Shadow x={41.2} y={-6} w={1.8} d={1.6} h={1.6} />
        <Shadow x={43.1} y={1.9} w={2.1} d={0.9} h={1.5} />
        <Shadow x={41.4} y={7.35} w={3.3} d={0.86} h={1.2} />
      </>
    );
  }
  if (layer === "back") {
    return (
      <>
        <Box x={41.2} y={-6} w={1.8} d={1.6} h={1.5} m="clay" />
        <Windows x={41.2} y={-6} z={0.5} w={1.8} d={1.6} h={0.6} face="left" cols={2} rows={1} />
        <Windows x={41.2} y={-6} z={0.5} w={1.8} d={1.6} h={0.6} face="right" cols={2} rows={1} />
        <Box x={41.15} y={-6.05} z={1.5} w={1.9} d={1.7} h={0.14} m="forest" />
        <ContainerYard stacks={PORT_BACK} />
        <Crane x={43.1} y={1.9} reach={4.6} />
        <Buoy x={50.5} y={4.2} />
        <Buoy x={56.5} y={4.2} />
        <Buoy x={62.5} y={4.2} />
      </>
    );
  }
  return (
    <>
      <ContainerYard stacks={PORT_FRONT} />
      <Truck x={41.4} y={7.35} load="sand" />
      <Buoy x={53.5} y={7.9} />
      <Buoy x={59.5} y={7.9} />
    </>
  );
}
