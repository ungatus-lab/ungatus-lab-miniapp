"use client";

import { useRouter } from "next/navigation";

export default function CenterRoom() {
  const router = useRouter();

  return (
    <div style={{
      padding: 20,
      textAlign: "center"
    }}>
      
      <h1 style={{ marginBottom: 20 }}>
        Center Room
      </h1>

      <p style={{ marginBottom: 30 }}>
        Добро пожаловать в PixelGrid Mini App.<br/>
        Здесь будет ваш дашборд, аллокации и инфо‑доска.
      </p>

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginTop: 20
      }}>
        
        <button onClick={() => router.push("/device-room")}>
          Device Room
        </button>

        <button onClick={() => router.push("/collab-room")}>
          Collab Room
        </button>

        <button onClick={() => router.push("/market-room")}>
          Market Room
        </button>

        <button onClick={() => router.push("/profile-room")}>
          Profile Room
        </button>

      </div>
    </div>
  );
}
