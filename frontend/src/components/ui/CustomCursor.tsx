"use client";

import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [ring, setRing] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let ringX = 0;
    let ringY = 0;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const animateRing = () => {
      ringX += (pos.x - ringX) * 0.12;
      ringY += (pos.y - ringY) * 0.12;
      setRing({ x: ringX, y: ringY });
      rafId = requestAnimationFrame(animateRing);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "A" || target.tagName === "BUTTON" || target.closest("a") || target.closest("button")) {
        setIsHovering(true);
      }
    };

    const onMouseOut = () => setIsHovering(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseover", onMouseOver);
    window.addEventListener("mouseout", onMouseOut);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    rafId = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, [pos.x, pos.y]);

  if (!mounted || (typeof window !== "undefined" && window.innerWidth < 768)) return null;

  return (
    <>
      <div
        className="custom-cursor"
        style={{
          left: pos.x,
          top: pos.y,
          width: isHovering ? "30px" : "12px",
          height: isHovering ? "30px" : "12px",
          opacity: isVisible ? 1 : 0,
          transition: "width 0.3s, height 0.3s, opacity 0.3s",
        }}
      />
      {/* <div
        className="custom-cursor-ring"
        style={{
          left: ring.x,
          top: ring.y,
          width: isHovering ? "60px" : "40px",
          height: isHovering ? "60px" : "40px",
          opacity: isVisible ? 1 : 0,
          borderColor: isHovering ? "rgba(232,116,138,0.8)" : "rgba(232,116,138,0.5)",
          transition: "width 0.3s, height 0.3s, border-color 0.3s, opacity 0.3s",
        }}
      /> */}
    </>
  );
}
