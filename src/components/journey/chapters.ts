import type { ScreenPoint } from "@/lib/iso";
import { cameraTarget, type Leg } from "@/lib/journey";

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

export const CAMERA_STOPS: readonly ScreenPoint[] = CHAPTERS.map(({ focus }) =>
  cameraTarget(focus[0], focus[1], WORLD.origin),
);

export type CargoLeg = Leg & {
  id: "road" | "sea" | "city";
  /** The lane the vehicle keeps to, in world y. */
  y: number;
};

/**
 * The gold cargo's journey, one vehicle per leg, handing over at the quays: a
 * truck down the road from the field to the India quay over chapters 1–3, the
 * ship across the sea in chapter 4 (x is its stern), a van into Doha in 5.
 */
export const CARGO_LEGS: readonly CargoLeg[] = [
  { id: "road", from: 3, to: 42, y: 5.52, chapters: [0, 3] },
  { id: "sea", from: 46.4, to: 57, y: 5, chapters: [3, 4] },
  { id: "city", from: 67.4, to: 77, y: 5.6, chapters: [4, 5] },
];
