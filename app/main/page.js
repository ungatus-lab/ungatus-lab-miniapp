"use client";

import { useRouter } from "next/navigation";

export default function MainScreen() {
  const router = useRouter();

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#0b0b0b",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 40,
        color: "white",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Заголовок */}
      <h1 style={{ marginBottom: 40, fontSize: 28, fontWeight: 600 }}>
        PixelGrid Mini App
      </h1>

      {/* Круг комнат */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 30,
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          maxWidth: 900,
        }}
      >
        {/* Device Room */}
        <button
          onClick={() => router.push("/device-room")}
          style={roomButtonStyle}
        >
          Device
        </button>

        {/* Collab Room */}
        <button
          onClick={() => router.push("/collab-room")}
          style={roomButtonStyle}
        >
          Collab
        </button>

        {/* Center Room */}
        <button
          onClick={() => router.push("/center-room")}
          style={{
            ...roomButtonStyle,
            backgroundColor: "#1a1a1a",
            border: "3px solid #4caf50",
            boxShadow: "0 0 12px #4caf50",
          }}
        >
          Center
        </button>

        {/* Market Room */}
        <button
          onClick={() => router.push("/market-room")}
          style={roomButtonStyle}
        >
          Market
        </button>

        {/* Profile Room */}
        <button
          onClick={() => router.push("/profile-room")}
          style={{
            ...roomButtonStyle,
            backgroundColor: "#1a1a1a",
            border: "3px solid #2196f3",
            boxShadow: "0 0 12px #2196f3",
          }}
        >
          Profile
        </button>
      </div>
    </div>
  );
}

const roomButtonStyle = {
  width: 140,
  height: 140,
  borderRadius: "50%",
  backgroundColor: "#141414",
  border: "2px solid #333",
  color: "white",
  fontSize: 18,
  fontWeight: 500,
  cursor: "pointer",
  transition: "0.2s",
};
