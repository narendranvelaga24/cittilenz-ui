"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

const RANDOM_CHARS = "_!X$0-+*#";

function getRandomChar(prevChar) {
  let char;
  do {
    char = RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
  } while (char === prevChar);
  return char;
}

export function SpecialText({
  children,
  speed = 20,
  delay = 0,
  className = "",
  inView = false,
  once = true,
}) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once, margin: "-100px" });
  const shouldAnimate = inView ? isInView : true;
  const text = children;
  const [hasStarted, setHasStarted] = useState(() => !inView && delay <= 0);
  const [displayText, setDisplayText] = useState(" ".repeat(text.length));
  const [currentPhase, setCurrentPhase] = useState("phase1");
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    if (!shouldAnimate || hasStarted) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setHasStarted(true);
      setDisplayText(" ".repeat(text.length));
      setCurrentPhase("phase1");
      setAnimationStep(0);
    }, Math.max(delay, 0) * 1000);

    return () => window.clearTimeout(timerId);
  }, [delay, hasStarted, shouldAnimate, text.length]);

  useEffect(() => {
    if (!hasStarted) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      if (currentPhase === "phase1") {
        const maxSteps = text.length * 2;
        const currentLength = Math.min(animationStep + 1, text.length);
        const chars = [];

        for (let index = 0; index < currentLength; index += 1) {
          const prevChar = index > 0 ? chars[index - 1] : undefined;
          chars.push(getRandomChar(prevChar));
        }

        for (let index = currentLength; index < text.length; index += 1) {
          chars.push("\u00A0");
        }

        setDisplayText(chars.join(""));

        if (animationStep < maxSteps - 1) {
          setAnimationStep((prev) => prev + 1);
          return;
        }

        setCurrentPhase("phase2");
        setAnimationStep(0);
        return;
      }

      const revealedCount = Math.floor(animationStep / 2);
      const chars = [];

      for (let index = 0; index < revealedCount && index < text.length; index += 1) {
        chars.push(text[index]);
      }

      if (revealedCount < text.length) {
        chars.push(animationStep % 2 === 0 ? "_" : getRandomChar());
      }

      for (let index = chars.length; index < text.length; index += 1) {
        chars.push(getRandomChar());
      }

      setDisplayText(chars.join(""));

      if (animationStep < text.length * 2 - 1) {
        setAnimationStep((prev) => prev + 1);
        return;
      }

      setDisplayText(text);
    }, speed);

    return () => window.clearTimeout(timerId);
  }, [animationStep, currentPhase, hasStarted, speed, text]);

  useEffect(() => {
    if (!hasStarted) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setDisplayText(" ".repeat(text.length));
      setCurrentPhase("phase1");
      setAnimationStep(0);
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [hasStarted, text]);

  return (
    <span ref={containerRef} className={`special-text-root ${className}`.trim()}>
      {displayText}
    </span>
  );
}
