"use client";

import { useState, useEffect, useRef } from "react";

const REPOS = [
  "facebook/react",
  "vercel/next.js",
  "microsoft/vscode",
  "torvalds/linux",
];

const TYPE_SPEED = 80;
const DELETE_SPEED = 40;
const PAUSE_DURATION = 2000;

interface TypewriterPlaceholderProps {
  isVisible: boolean;
}

export function TypewriterPlaceholder({ isVisible }: TypewriterPlaceholderProps) {
  const [text, setText] = useState("");
  const repoIndexRef = useRef(0);
  const phaseRef = useRef<"typing" | "pausing" | "deleting">("typing");
  const charIndexRef = useRef(0);

  useEffect(() => {
    if (!isVisible) {
      setText("");
      repoIndexRef.current = 0;
      phaseRef.current = "typing";
      charIndexRef.current = 0;
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    function step() {
      const repo = REPOS[repoIndexRef.current];

      if (phaseRef.current === "typing") {
        charIndexRef.current++;
        setText(repo.slice(0, charIndexRef.current));
        if (charIndexRef.current >= repo.length) {
          phaseRef.current = "pausing";
          timer = setTimeout(step, PAUSE_DURATION);
        } else {
          timer = setTimeout(step, TYPE_SPEED);
        }
      } else if (phaseRef.current === "pausing") {
        phaseRef.current = "deleting";
        timer = setTimeout(step, DELETE_SPEED);
      } else if (phaseRef.current === "deleting") {
        charIndexRef.current--;
        setText(repo.slice(0, charIndexRef.current));
        if (charIndexRef.current <= 0) {
          phaseRef.current = "typing";
          repoIndexRef.current = (repoIndexRef.current + 1) % REPOS.length;
          timer = setTimeout(step, TYPE_SPEED + 200);
        } else {
          timer = setTimeout(step, DELETE_SPEED);
        }
      }
    }

    timer = setTimeout(step, 500);
    return () => clearTimeout(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <span className="pointer-events-none text-white/40">
      {text}
      <span className="animate-cursor-blink ml-[1px]">|</span>
    </span>
  );
}
