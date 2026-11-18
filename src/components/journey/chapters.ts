import type { ScreenPoint } from "@/lib/iso";
import { buildTimeline, cameraTarget, type Beat, type CargoTrack } from "@/lib/journey";

export type ChapterId = "field" | "mill" | "packed" | "port" | "doha";

export type Chapter = {
  id: ChapterId;
  label: string;
  title: string;
  /** Verified facts only: every claim here traces to docs/01-company-facts.md. */
  text: string;
  /** The ground point (world x, y) the camera centres on. */
  focus: readonly [number, number];
};

/**
 * The world's SVG canvas — big enough for every camera stop at any viewport,
 * with world (0, 0) drawn at `origin`.
 */
export const WORLD = { width: 4850, height: 2800, origin: [1250, 450] as ScreenPoint };

/** The road, the shipping lane and the route line all run along x at this y. */
export const ROUTE_Y = 6;

/**
 * Nothing here claims a fleet, a warehouse or a named port: the fact sheet
 * lists those as unverifiable. The trucks and the ship carry the product's
 * journey, not TFS's assets.
 */
export const CHAPTERS: readonly Chapter[] = [
  {
    id: "field",
    label: "Field",
    title: "Grown in Telangana",
    text: "91 Telangana Gold names its origin on the sack: Telangana, Korutla.",
    focus: [6, ROUTE_Y],
  },
  {
    id: "mill",
    label: "Mill",
    title: "Milled and sorted",
    text: "91 Telangana Gold and 911 Sona Masoori carry the Satake Japan 100% Sortex mark.",
    focus: [19.5, 3.5],
  },
  {
    id: "packed",
    label: "Packed",
    title: "Packed for the trade",
    text: "In 18, 20 and 35 kg sacks, several labelled in English, Telugu and Arabic.",
    focus: [31, 3.5],
  },
  {
    id: "port",
    label: "Port & sea",
    title: "From India to Qatar",
    text: "Sourced in India and imported by TF Suncons, an importer and distributor in Doha.",
    focus: [46.5, 5],
  },
  {
    id: "doha",
    label: "Doha",
    title: "On Qatar’s tables",
    text: "For retail, industrial and food-service buyers — hotels, restaurants and caterers among them.",
    focus: [74.5, 7],
  },
];

/** Each chapter's stop: the camera's target with its focus point centred. */
export const CAMERA_STOPS: readonly ScreenPoint[] = CHAPTERS.map(({ focus }) =>
  cameraTarget(focus[0], focus[1], WORLD.origin),
);

const [FIELD, MILL, PACKED, PORT, DOHA] = CAMERA_STOPS;

/** Over the water off the Doha quay, where the camera rests as the ship docks, with the waiting van in view. */
const DOHA_QUAY = cameraTarget(59, 5.2, WORLD.origin);

/**
 * The scroll story, beat by beat. Every chapter holds still long enough to
 * read, then the camera glides on with the cargo. The sea crossing is the
 * slowest glide: the camera sails with the ship, pauses as it docks, then
 * follows the van into the city. Units are relative; the scroll length is
 * set from their total (JourneyHero, styles/journey.css).
 */
export const BEATS: readonly Beat[] = [
  { kind: "hold", chapter: 0, units: 0.8, camera: FIELD },
  { kind: "glide", chapter: 0, units: 1.6, camera: MILL },
  { kind: "hold", chapter: 1, units: 1.2, camera: MILL },
  { kind: "glide", chapter: 1, units: 1.6, camera: PACKED },
  { kind: "hold", chapter: 2, units: 1.2, camera: PACKED },
  { kind: "glide", chapter: 2, units: 1.6, camera: PORT },
  { kind: "hold", chapter: 3, units: 1.4, camera: PORT },
  { kind: "glide", chapter: 3, units: 2.6, camera: DOHA_QUAY },
  { kind: "hold", chapter: 3, units: 0.6, camera: DOHA_QUAY },
  { kind: "glide", chapter: 3, units: 1.4, camera: DOHA },
  { kind: "hold", chapter: 4, units: 1.6, camera: DOHA },
];

export const TIMELINE = buildTimeline(BEATS);

export type Cargo = CargoTrack & {
  id: "road" | "sea" | "city";
  /** The lane the vehicle keeps to, in world y. Its route is world x: the truck's tail, the ship's stern, the van's tail. */
  y: number;
};

/**
 * The gold cargo, relayed from vehicle to vehicle. Moments are beat indices
 * (lib/journey). The truck drives with the camera and stops at the mill and
 * the yard; at the India quay it hands the load to the docked ship and fades
 * out. The ship crosses during the long glide, and the van, waiting on the
 * Doha quay, drives it into the city.
 */
export const CARGO: readonly Cargo[] = [
  {
    id: "road",
    y: 5.52,
    route: [
      [1, 3],
      [2, 17.5],
      [3, 17.5],
      [4, 29.5],
      [5, 29.5],
      [6, 42],
    ],
    fade: [
      [6.5, 1],
      [7, 0],
    ],
  },
  {
    id: "sea",
    y: 5,
    route: [
      [7, 46.4],
      [8, 57],
    ],
  },
  {
    id: "city",
    y: 5.6,
    route: [
      [9, 67.4],
      [10, 77],
    ],
  },
];
