"use client";

/** Buyers print or save spec pages; the print stylesheet sets this one as a single sheet. */
export function PrintSheetButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="t-meta inline-flex min-h-11 items-center gap-2 border border-ivory/40 px-4 text-ivory transition-colors hover:border-ivory hover:bg-ivory hover:text-forest"
    >
      Print or save this sheet
    </button>
  );
}
