import { ViewTransition, type ReactNode } from "react";

/**
 * Wraps a page's content so route changes cross-fade (styles/motion.css,
 * `.page`). It belongs in each page, not the layout: layouts persist across
 * navigations, so enter and exit would never fire there.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      {children}
    </ViewTransition>
  );
}
