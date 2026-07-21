"use client";

export default function WelcomeScreen() {
  const tg = typeof window !== "undefined" ? window.Telegram.WebApp : null;

  const handleStart = async () => {
    const telegramId = tg?.initDataUnsafe?.user?.id;

    await fetch("/api/index", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegram_id: telegramId })
    });

    window.location.href = "/main";
  };

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <img src="/cat_welcome.png" style={{ width: 200, marginBottom: 20 }} />

      <h1>Welcome to PixelGrid</h1>

      <button
        style={{
          marginTop: 30,
          padding: "12px 24px",
          fontSize: 18,
          borderRadius: 12,
          background: "#4A90E2",
          color: "#fff",
          border: "none"
        }}
        onClick={handleStart}
      >
        GET STARTED
      </button>
    </div>
  );
}
