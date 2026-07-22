"use client";

import { useRouter } from "next/navigation";

export default function DeviceRoom() {
  const router = useRouter();

  return (
    <div style={{
      padding: 20,
      textAlign: "center"
    }}>
      
      <h1 style={{ marginBottom: 20 }}>
        Device Room
      </h1>

      <p style={{ marginBottom: 30 }}>
        Комната устройств PixelGrid.<br/>
        Здесь в нативке находятся Remote Scanner, Multi‑Device, Emulator и другие инструменты.<br/>
        В Mini App эта комната работает как презентация.
      </p>

      <div style={{
        border: "1px solid #444",
        padding: 20,
        borderRadius: 12,
        marginBottom: 30
      }}>
        <h3>Что будет доступно в нативке:</h3>
        <ul style={{ textAlign: "left", marginTop: 10 }}>
          <li>Remote Scanner</li>
          <li>Multi‑Device Control</li>
          <li>Device Emulator</li>
          <li>Системные сканеры</li>
          <li>Подключение к ПК и Android</li>
        </ul>
      </div>

      <button
        style={{ marginBottom: 20 }}
        onClick={() => router.push("/main")}
      >
        Вернуться в Main Screen
      </button>

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginTop: 20
      }}>
        
        <button onClick={() => router.push("/collab-room")}>
          Collab Room
        </button>

        <button onClick={() => router.push("/center-room")}>
          Center Room
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
