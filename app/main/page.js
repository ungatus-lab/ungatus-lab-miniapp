"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MainRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("pgm_started", "1");
      window.localStorage.setItem("pgm_active_room", "center");
    }

    router.replace("/");
  }, [router]);

  return (
    <main
      style={{
        width: "100%",
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.22), transparent 32%), linear-gradient(180deg, #121212 0%, #0b0b0b 100%)",
        color: "white",
        display: "grid",
        placeItems: "center",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <section
        style={{
          width: "min(380px, calc(100% - 32px))",
          padding: 24,
          borderRadius: 24,
          background: "rgba(20,20,20,0.86)",
          border: "1px solid rgba(255,255,255,0.09)",
          textAlign: "center",
          boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
        }}
      >
        <h1 style={{ margin: "0 0 10px", fontSize: 28 }}>
          PixelGridMacro
        </h1>

        <p
          style={{
            margin: 0,
            color: "rgba(255,255,255,0.64)",
            lineHeight: 1.5,
          }}
        >
          Opening Center Room...
        </p>
      </section>
    </main>
  );
}
