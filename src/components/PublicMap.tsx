"use client";

import dynamic from "next/dynamic";

const PublicMapInner = dynamic(() => import("./PublicMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] w-full items-center justify-center rounded-xl bg-slate-100 text-slate-400">
      नकाशा लोड होत आहे...
    </div>
  ),
});

export default PublicMapInner;
