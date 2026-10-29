import { CARGO } from "./chapters";
import { Ship, Truck, Van } from "./Vehicles";

const VEHICLES = { road: Truck, sea: Ship, city: Van } as const;

/**
 * The gold cargo — the moving things in the world that are TFS's own. A truck
 * brings it down the road to the India quay, where the ship waits; the ship
 * carries it over the sea to the Doha quay, where the van waits to take it
 * into the city. Each is drawn once, where its route starts; JourneyStage
 * slides it along as the visitor scrolls (a transform on its group) and fades
 * the truck out once it has handed over. This markup is the first frame, and
 * the no-JavaScript one.
 */
export function Cargo() {
  return (
    <g className="journey-cargo">
      {CARGO.map(({ id, route, y }) => {
        const Vehicle = VEHICLES[id];
        return (
          <g key={id} data-cargo={id}>
            <Vehicle x={route[0][1]} y={y} load="gold" />
          </g>
        );
      })}
    </g>
  );
}
