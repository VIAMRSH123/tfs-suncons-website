import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";
import {
  INTRO_BOOT_SCRIPT,
  INTRO_ENTRY_ATTRIBUTE,
  INTRO_LOGO,
  INTRO_SEEN_KEY,
  INTRO_TIMING,
  flightBetween,
  flightTransform,
  isPlainClick,
  onIntroRequest,
  requestIntro,
} from "./intro";

describe("flightBetween", () => {
  it("lands one box on another, centre on centre, scaled to its width", () => {
    const intro = { left: 580, top: 300, width: 280, height: 167 };
    const header = { left: 47, top: 16, width: 67, height: 40 };
    const flight = flightBetween(intro, header);
    expect(flight.x).toBeCloseTo(47 + 33.5 - (580 + 140));
    expect(flight.y).toBeCloseTo(16 + 20 - (300 + 83.5));
    expect(flight.scale).toBeCloseTo(67 / 280);
  });

  it("is the identity between a box and itself", () => {
    const box = { left: 10, top: 20, width: 30, height: 40 };
    expect(flightBetween(box, box)).toEqual({ x: 0, y: 0, scale: 1 });
  });

  it("stays put when either box has no size — an image not laid out yet", () => {
    const box = { left: 10, top: 20, width: 30, height: 40 };
    expect(flightBetween({ ...box, width: 0 }, box)).toEqual({ x: 0, y: 0, scale: 1 });
    expect(flightBetween(box, { ...box, width: 0 })).toEqual({ x: 0, y: 0, scale: 1 });
  });
});

describe("flightTransform", () => {
  it("writes a translate then a scale, rounded for the style attribute", () => {
    expect(flightTransform({ x: -606.45, y: -347.5, scale: 0.239285 })).toBe(
      "translate(-606.5px, -347.5px) scale(0.2393)",
    );
  });
});

describe("isPlainClick", () => {
  const click = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false };

  it("takes a plain main-button click", () => {
    expect(isPlainClick(click)).toBe(true);
  });

  it("leaves new-tab, new-window and already-handled clicks to the browser", () => {
    expect(isPlainClick({ ...click, metaKey: true })).toBe(false);
    expect(isPlainClick({ ...click, ctrlKey: true })).toBe(false);
    expect(isPlainClick({ ...click, shiftKey: true })).toBe(false);
    expect(isPlainClick({ ...click, altKey: true })).toBe(false);
    expect(isPlainClick({ ...click, button: 1 })).toBe(false);
    expect(isPlainClick({ ...click, defaultPrevented: true })).toBe(false);
  });
});

describe("requestIntro", () => {
  it("is refused while nothing listens, so the link navigates as usual", () => {
    expect(requestIntro()).toBe(false);
  });

  it("is taken when a listener accepts it, and refused once it unsubscribes", () => {
    const listener = vi.fn(() => true);
    const stop = onIntroRequest(listener);
    expect(requestIntro()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    stop();
    expect(requestIntro()).toBe(false);
  });

  it("is refused when the listener is busy", () => {
    const stop = onIntroRequest(() => false);
    expect(requestIntro()).toBe(false);
    stop();
  });
});

describe("INTRO_BOOT_SCRIPT", () => {
  type Boot = { hidden?: boolean; reducedMotion?: boolean; seen?: boolean; storageThrows?: boolean };

  type FakeLink = { rel?: string; as?: string; href?: string; attributes: Record<string, string> };

  /** Runs the boot script against a fake document; returns its attributes, preloads and the pending failsafe. */
  function boot({ hidden = false, reducedMotion = false, seen = false, storageThrows = false }: Boot = {}) {
    const attributes = new Map<string, string>();
    const timers: (() => void)[] = [];
    const preloads: FakeLink[] = [];
    const documentElement = {
      setAttribute: (name: string, value: string) => attributes.set(name, value),
      getAttribute: (name: string) => attributes.get(name) ?? null,
      removeAttribute: (name: string) => attributes.delete(name),
    };
    const createElement = (): FakeLink => {
      const link: FakeLink = { attributes: {} };
      return Object.assign(link, { setAttribute: (name: string, value: string) => (link.attributes[name] = value) });
    };
    runInNewContext(INTRO_BOOT_SCRIPT, {
      document: { documentElement, hidden, createElement, head: { appendChild: (link: FakeLink) => preloads.push(link) } },
      matchMedia: () => ({ matches: reducedMotion }),
      sessionStorage: {
        getItem: (key: string) => {
          if (storageThrows) throw new Error("storage blocked");
          return seen && key === INTRO_SEEN_KEY ? "1" : null;
        },
      },
      setTimeout: (callback: () => void, delay: number) => {
        expect(delay).toBe(INTRO_TIMING.failsafe);
        timers.push(callback);
      },
    });
    return { attributes, timers, preloads };
  }

  it("starts the intro on a visit's first paint, preloading the logo it needs", () => {
    const { attributes, preloads } = boot();
    expect(attributes.get("data-intro")).toBe("load");
    expect(attributes.has(INTRO_ENTRY_ATTRIBUTE)).toBe(true);
    expect(preloads).toEqual([
      expect.objectContaining({ rel: "preload", as: "image", href: INTRO_LOGO, attributes: { fetchpriority: "high" } }),
    ]);
  });

  it("lifts the intro after the failsafe if the page's scripts never take over", () => {
    const { attributes, timers } = boot();
    timers.forEach((run) => run());
    expect(attributes.has("data-intro")).toBe(false);
    expect(attributes.has(INTRO_ENTRY_ATTRIBUTE)).toBe(false);
  });

  it("leaves a page that has moved on past the intro alone when the failsafe fires", () => {
    const { attributes, timers } = boot();
    attributes.set("data-intro", "exit");
    timers.forEach((run) => run());
    expect(attributes.get("data-intro")).toBe("exit");
  });

  it("stays out of the way — and downloads nothing — after it has played in this tab, with reduced motion, in a background tab, or without storage", () => {
    for (const state of [{ seen: true }, { reducedMotion: true }, { hidden: true }, { storageThrows: true }]) {
      const { attributes, preloads } = boot(state);
      expect(attributes.size).toBe(0);
      expect(preloads).toHaveLength(0);
    }
  });
});
