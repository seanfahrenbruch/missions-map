"use client";

import dynamic from "next/dynamic";

const MissionMap = dynamic(() => import("./components/MissionMap"), {
  ssr: false,
  loading: () => (
    <div className="h-dvh w-screen flex items-center justify-center bg-gray-950 text-gray-400 text-sm">
      Loading map…
    </div>
  ),
});

export default function Home() {
  return <MissionMap />;
}
