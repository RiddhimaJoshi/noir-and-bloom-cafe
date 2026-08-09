import React, { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const ref = useRef(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    const el = ref.current;
    const move = (e) => {
      if (!el) return;
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };
    const over = (e) => {
      const t = e.target;
      if (t.closest("a, button, [data-cursor='hover']")) setHover(true);
    };
    const out = () => setHover(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mouseout", out);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mouseout", out);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`cursor-dot ${hover ? "hover" : ""}`}
      aria-hidden="true"
    />
  );
}
