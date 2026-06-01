"use client";

import { useEffect, useState } from "react";
import AlchemicalLoader from "@/components/landing/AlchemicalLoader";

export default function LoaderWrapper() {
  const [mounted, setMounted] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const minimumMs = 2600;
    const maximumMs = 4600;
    const fadeMs = 650;
    let finished = false;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      if (finished) return;
      finished = true;
      document.documentElement.classList.add("scorch-loader-ready");
      setExiting(true);
      fadeTimer = setTimeout(() => setMounted(false), fadeMs);
    };

    const minimumTimer = setTimeout(() => {
      if (document.readyState === "complete") {
        finish();
      }
    }, minimumMs);

    const maximumTimer = setTimeout(finish, maximumMs);

    const handleLoad = () => {
      setTimeout(finish, minimumMs);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad, { once: true });
    }

    return () => {
      window.removeEventListener("load", handleLoad);
      clearTimeout(minimumTimer);
      clearTimeout(maximumTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, []);

  if (!mounted) return null;

  return <AlchemicalLoader exiting={exiting} />;
}
