"use client";

import { useEffect, useState } from "react";

export default function ProfileRoom() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    const telegramId = tg.initDataUnsafe.user.id;

    fetch(`/api/index?telegram_id=${telegramId}`)
      .then(res => res.json())
      .then(data => setProfile(data));
  }, []);

  if (!profile) {
    return <div>Loading...</div>;
  }

  const openNative = () => {
    const tg = window.Telegram.WebApp;
    const telegramId = tg.initDataUnsafe.user.id;

    window.location.href = `pixelgrid://open?telegram_id=${telegramId}`;
  };

  return (
    <div className="profile-room">
      <img src={profile.avatar_url || "/default_avatar.png"} className="avatar" />

      <h2>{profile.nickname}</h2>

      <div className="stats">
        <p>Balance: {profile.balance} UGT</p>
        <p>Allocations: {profile.allocations.length}</p>
      </div>

      <div className="packages">
        {profile.packages.map(pkg => (
          <div key={pkg.id} className="package-card">
            <h3>{pkg.name}</h3>
            <p>{pkg.description}</p>
            <p>{pkg.price} UGT</p>
          </div>
        ))}
      </div>

      <button className="open-native" onClick={openNative}>
        Открыть комнаты
      </button>
    </div>
  );
}
