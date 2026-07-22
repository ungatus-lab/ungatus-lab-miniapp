"use client";

import { useRouter } from "next/navigation";

export default function MainScreen() {
  const router = useRouter();

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#0d0d0d",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 40,
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      {/* Заголовок */}
      <h1 style={{ marginBottom: 40 }}>PixelGrid Mini App</h1>

      {/* Круг комнат */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 20,
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
          Device Room
        </button>

        {/* Collab Room */}
        <button
          onClick={() => router.push("/collab-room")}
          style={roomButtonStyle}
        >
          Collab Room
        </button>

        {/* Center Room */}
        <button
          onClick={() => router.push("/center-room")}
          style={{
            ...roomButtonStyle,
            backgroundColor: "#1e1e1e",
            border: "2px solid #4caf50",
          }}
        >
          Center Room
        </button>

        {/* Market Room */}
        <button
          onClick={() => router.push("/market-room")}
          style={roomButtonStyle}
        >
          Market Room
        </button>

        {/* Profile Room */}
        <button
          onClick={() => router.push("/profile-room")}
          style={{
            ...roomButtonStyle,
            backgroundColor: "#1e1e1e",
            border: "2px solid #2196f3",
          }}
        >
          Profile Room
        </button>
      </div>
    </div>
  );
}

const roomButtonStyle = {
  width: 150,
  height: 150,
  borderRadius: "50%",
  backgroundColor: "#1e1e1e",
  border: "2px solid #333",
  color: "white",
  fontSize: 16,
  cursor: "pointer",
};
