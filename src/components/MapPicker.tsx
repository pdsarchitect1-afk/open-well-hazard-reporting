"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window`, so load the map only on the client.
const MapPickerInner = dynamic(() => import("./MapPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded-xl bg-slate-100 text-slate-400">
      नकाशा लोड होत आहे...
    </div>
  ),
});

export default MapPickerInner;
