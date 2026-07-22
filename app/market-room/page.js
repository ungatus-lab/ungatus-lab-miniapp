"use client";

import { useRouter } from "next/navigation";

export default function MarketRoom() {
  const router = useRouter();

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#0b0b0b",
        color: "white",
        padding: 30,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Заголовок */}
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 20 }}>
        Market Room
      </h1>

      {/* Описание */}
      <p style={{ fontSize: 16, lineHeight: "24px", marginBottom: 30 }}>
        Комната маркетплейса PixelGrid.<br />
        В нативке здесь находятся пакеты мощностей, аренда инструментов,
        покупка автоматизации и внутренняя экономика UGT.<br />
        В Mini App эта комната работает как презентация.
      </p>

      {/* Блок возможностей */}
      <div
        style={{
          border: "1px solid #333",
          borderRadius: 12,
          padding: 20,
          marginBottom: 40,
          backgroundColor: "#141414",
        }}
      >
        <h3 style={{ marginBottom: 12 }}>Что будет доступно в нативке:</h3>

        <ul style={{ marginLeft: 20, lineHeight: "26px" }}>
          <li>Покупка мощностей</li>
          <li>Аренда инструментов</li>
          <li>Пакеты автоматизации</li>
          <li>UGT экономика</li>
          <li>Маркетплейс устройств</li>
        </ul>
      </div>

      {/* Навигация */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button style={navButton} onClick={() => router.push("/main")}>
          Main Screen
        </button>

        <button style={navButton} onClick={() => router.push("/device-room")}>
          Device Room
        </button>

        <button style={navButton} onClick={() => router.push("/collab-room")}>
          Collab Room
        </button>

        <button style={navButton} onClick={() => router.push("/center-room")}>
          Center Room
        </button>

        <button style={navButton} onClick={() => router.push("/profile-room")}>
          Profile Room
        </button>
      </div>
    </div>
  );
}

const navButton = {
  padding: "12px 20px",
  backgroundColor: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: 8,
  color: "white",
  cursor: "pointer",
  fontSize: 15,
};
