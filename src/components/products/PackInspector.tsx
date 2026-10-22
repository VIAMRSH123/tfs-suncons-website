"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { isTouchDevice } from "@/lib/motion";

type PackInspectorProps = {
  src: string;
  alt: string;
  productName: string;
};

const ZOOM = 2.6;
const LENS = 190;

/** Where an `object-fit: contain` image is actually drawn inside its element. */
function drawnBox(image: HTMLImageElement) {
  const rect = image.getBoundingClientRect();
  const ratio = image.naturalWidth && image.naturalHeight ? image.naturalWidth / image.naturalHeight : 1;
  let width = rect.width;
  let height = rect.height;
  if (width / height > ratio) width = height * ratio;
  else height = width / ratio;
  return {
    left: rect.left + (rect.width - width) / 2,
    top: rect.top + (rect.height - height) / 2,
    width,
    height,
  };
}

/**
 * The pack is the spec sheet — grade, net weight, origin and the 91 mark are
 * printed on it — so the product page lets a buyer read it. On a mouse, a lens
 * magnifies whatever is under the pointer, measured against the pack itself
 * rather than the box around it, so it never shows empty padding. On touch or
 * keyboard, "Inspect the pack" opens it full-screen at full resolution.
 */
export function PackInspector({ src, alt, productName }: PackInspectorProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const lens = lensRef.current;
    const image = stage?.querySelector("img");
    if (!stage || !lens || !image || isTouchDevice()) return;

    const hide = () => {
      lens.dataset.visible = "false";
    };

    const handleMove = (event: PointerEvent) => {
      const box = drawnBox(image);
      const x = event.clientX - box.left;
      const y = event.clientY - box.top;
      if (x < 0 || y < 0 || x > box.width || y > box.height) {
        hide();
        return;
      }
      const stageRect = stage.getBoundingClientRect();
      lens.dataset.visible = "true";
      lens.style.translate = `${event.clientX - stageRect.left - LENS / 2}px ${event.clientY - stageRect.top - LENS / 2}px`;
      lens.style.backgroundSize = `${box.width * ZOOM}px ${box.height * ZOOM}px`;
      lens.style.backgroundPosition = `${-(x * ZOOM - LENS / 2)}px ${-(y * ZOOM - LENS / 2)}px`;
    };

    stage.addEventListener("pointermove", handleMove);
    stage.addEventListener("pointerleave", hide);
    return () => {
      stage.removeEventListener("pointermove", handleMove);
      stage.removeEventListener("pointerleave", hide);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <div className="relative">
      <div ref={stageRef} className="pack-stage window-light relative aspect-square cursor-zoom-in p-10 md:p-16">
        <Image
          src={src}
          alt={alt}
          width={1000}
          height={1000}
          priority
          sizes="(max-width: 768px) 90vw, 45vw"
          className="pack h-full w-auto object-contain"
        />
        <div
          ref={lensRef}
          aria-hidden="true"
          data-visible="false"
          className="pack-lens pointer-events-none absolute left-0 top-0 rounded-full"
          style={{ width: LENS, height: LENS, backgroundImage: `url(${src})` }}
        />
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="t-meta mt-4 inline-flex min-h-11 items-center gap-2 text-forest link-underline"
      >
        <span aria-hidden="true">⤢</span> Inspect the pack
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setIsOpen(false)}
        aria-label={`${productName} pack, full size`}
        className="pack-dialog m-0 h-full max-h-none w-full max-w-none bg-ivory p-0 backdrop:bg-forest-deep/80"
      >
        <div className="flex h-full flex-col">
          <div className="shell flex items-center justify-between gap-4 py-4">
            <p className="t-meta text-gold">{productName} · full size — drag or scroll to read the pack</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="t-meta min-h-11 border border-forest px-4 text-forest hover:bg-forest hover:text-ivory"
              autoFocus
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {/* Native-size image in a scroll box: panning is just scrolling. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} width={1000} height={1000} className="mx-auto block h-auto w-[1000px] max-w-none" />
          </div>
        </div>
      </dialog>
    </div>
  );
}
