"use client";

import { useRouter } from "next/navigation";

export default function MainScreen() {
  const router = useRouter();

  return (
    <div className="main-screen">

      {/* Центр комнаты */}
      <div className="center-room disabled">
        <img src="/center.png" className="center-img" />
      </div>

      {/* Кнопки комнат */}
      <div className="rooms">

        <button className="room disabled">Device Room</button>
        <button className="room disabled">Market Room</button>
        <button className="room disabled">Collab Room</button>
        <button className="room disabled">Test Room</button>

        {/* Единственная активная комната */}
        <button
          className="room profile"
          onClick={() => router.push("/profile-room")}
        >
          Profile Room
        </button>

      </div>
    </div>
  );
}
