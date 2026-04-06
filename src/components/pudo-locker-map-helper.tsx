"use client";

import { useState } from "react";

const GENERAL_PUDO_MAP_URL = "https://www.google.com/maps/search/PUDO+locker+South+Africa";

export function PudoLockerMapHelper() {
  const [status, setStatus] = useState("");

  function openGeneralMap() {
    window.open(GENERAL_PUDO_MAP_URL, "_blank", "noopener,noreferrer");
  }

  function openNearbyMap() {
    if (!navigator.geolocation) {
      setStatus("Your device does not support location lookup. Use the PUDO map button instead.");
      return;
    }

    setStatus("Finding nearby lockers...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearbyUrl = `https://www.google.com/maps/search/PUDO+locker/@${latitude},${longitude},13z`;
        window.open(nearbyUrl, "_blank", "noopener,noreferrer");
        setStatus("Opened a nearby PUDO locker map in a new tab.");
      },
      () => {
        setStatus("Location access was denied. Use the general PUDO map and then paste the locker code or area below.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="mt-4 rounded-[1.25rem] border border-[var(--line)] bg-[var(--blush)]/45 p-4">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">PUDO maps</p>
      <p className="mt-2 text-sm leading-7 text-[var(--berry)]">
        Use the map to find the locker that suits you, then paste the locker code or area into the
        field below.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={openGeneralMap} className="button-secondary px-4 py-3 text-sm">
          Open PUDO Map
        </button>
        <button type="button" onClick={openNearbyMap} className="button-primary px-4 py-3 text-sm">
          Find Nearest Locker
        </button>
      </div>
      {status ? <p className="mt-3 text-sm text-[var(--mauve)]">{status}</p> : null}
    </div>
  );
}
