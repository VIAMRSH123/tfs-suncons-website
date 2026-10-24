import type { CSSProperties } from "react";
import { CARGO_LEGS } from "./chapters";
import { Ship, Truck, Van } from "./Vehicles";

const VEHICLES = { road: Truck, sea: Ship, city: Van } as const;

/** Every vehicle after the first waits out of sight until the cargo is handed to it. */
const WAITING: CSSProperties = { opacity: 0 };

/**
 * The gold cargo — the one moving thing in the world that is TFS's own. A
 * truck brings it down the road to the India quay, the ship carries it over
 * the sea and a van takes it into Doha. Each is drawn once, at the start of
 * its leg; JourneyStage slides it down the route as the visitor scrolls (a
 * transform on its group) and cross-fades them at the quays, so one is in
 * sight at a time. This markup is the first frame, and the no-JavaScript one.
 */
export function Cargo() {
  return (
    <g className="journey-cargo">
      {CARGO_LEGS.map(({ id, from, y }, index) => {
        const Vehicle = VEHICLES[id];
        return (
          <g key={id} data-cargo={id} style={index === 0 ? undefined : WAITING}>
            <Vehicle x={from} y={y} load="gold" />
          </g>
        );
      })}
    </g>
  );
}
