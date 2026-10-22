"use client";

import { useSyncExternalStore } from "react";
import {
  addLine,
  parseBasket,
  removeLine,
  setQuantity,
  type Basket,
  type BasketLine,
} from "@/lib/basket";

/**
 * The enquiry basket's single store: module state, persisted to
 * sessionStorage so a reload or a page change keeps it, and read through
 * useSyncExternalStore so every badge, card and form stays in step without a
 * provider. The server always renders an empty basket.
 */

const STORAGE_KEY = "tfs-enquiry-basket";
const EMPTY: Basket = [];

let state: Basket = EMPTY;
let isLoaded = false;
const listeners = new Set<() => void>();

function load() {
  if (isLoaded || typeof window === "undefined") return;
  isLoaded = true;
  try {
    state = parseBasket(window.sessionStorage.getItem(STORAGE_KEY));
  } catch {
    // Storage blocked (private mode, policy): the basket still works for this page.
    state = EMPTY;
  }
}

function commit(next: Basket) {
  state = next;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Not persisted, but the in-memory basket is still correct.
  }
  listeners.forEach((listener) => listener());
}

export const basketActions = {
  add(line: BasketLine) {
    load();
    commit(addLine(state, line));
  },
  set(slug: string, packSize: string, quantity: number) {
    load();
    commit(setQuantity(state, slug, packSize, quantity));
  },
  remove(slug: string, packSize: string) {
    load();
    commit(removeLine(state, slug, packSize));
  },
  clear() {
    load();
    commit(EMPTY);
  },
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Basket {
  load();
  return state;
}

function getServerSnapshot(): Basket {
  return EMPTY;
}

export function useBasket(): Basket {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
