"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";

interface DropdownProps {
  trigger: (props: { isOpen: boolean; toggle: () => void }) => ReactNode;
  children: (props: { close: () => void }) => ReactNode;
  align?: "left" | "right";
}

export function Dropdown({ trigger, children, align = "left" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  useClickOutside(ref, close);

  return (
    <div className="relative" ref={ref}>
      {trigger({ isOpen, toggle })}
      {isOpen && (
        <div
          className={`absolute top-10 z-40 min-w-[150px] overflow-hidden rounded-xl border border-warm-200 bg-white py-1 shadow-layered-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children({ close })}
        </div>
      )}
    </div>
  );
}
