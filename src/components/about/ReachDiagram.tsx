import type { CSSProperties } from "react";
import { DrawOnView } from "@/components/motion/DrawOnView";

type Node = { label: string; x: number; y: number; isOrigin?: boolean };

/**
 * An abstract diagram, not a map: the company's own stated reach — India,
 * Africa, Dubai, Qatar — and nothing more. No ports, routes or volumes are
 * drawn, because none is published.
 */
const ORIGIN: Node = { label: "India", x: 300, y: 205, isOrigin: true };
const DESTINATIONS: readonly Node[] = [
  { label: "Qatar", x: 900, y: 130 },
  { label: "Dubai", x: 810, y: 262 },
  { label: "Africa", x: 610, y: 345 },
];

const arc = (to: Node) => {
  const midX = (ORIGIN.x + to.x) / 2;
  const midY = Math.min(ORIGIN.y, to.y) - 120;
  return `M ${ORIGIN.x} ${ORIGIN.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
};

export function ReachDiagram() {
  return (
    <figure className="m-0">
      <DrawOnView>
        <svg viewBox="0 0 1200 420" role="img" aria-labelledby="reach-diagram-title" className="h-auto w-full">
          <title id="reach-diagram-title">
            Abstract diagram of TFS&rsquo;s stated reach: from India to Qatar, Dubai and Africa
          </title>
          {DESTINATIONS.map((node, index) => (
            <path
              key={node.label}
              d={arc(node)}
              pathLength={1}
              fill="none"
              stroke="var(--color-gold)"
              strokeWidth={1.4}
              strokeLinecap="round"
              style={{ "--i": index } as CSSProperties}
            />
          ))}
          {[ORIGIN, ...DESTINATIONS].map((node) => (
            <g key={node.label}>
              <circle
                cx={node.x}
                cy={node.y}
                r={node.isOrigin ? 9 : 6}
                fill={node.isOrigin ? "var(--color-forest)" : "var(--color-paper)"}
                stroke="var(--color-forest)"
                strokeWidth={1.5}
              />
              <text
                x={node.x}
                y={node.y + (node.isOrigin ? 38 : 30)}
                textAnchor="middle"
                className="fill-forest font-display"
                fontSize={node.isOrigin ? 30 : 24}
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </DrawOnView>
      <figcaption className="hairline mt-3 flex flex-wrap items-baseline justify-between gap-3 pt-3">
        <span className="t-meta text-gold">India → the Gulf and Africa</span>
        <span className="t-meta text-muted">An abstract diagram, not a map</span>
      </figcaption>
    </figure>
  );
}
