import Link from "next/link";

import dynamic from "next/dynamic";
const PhaserGame = dynamic(() => import("../app/components/PhaserGame"), {
  ssr: false,
});
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-white">
      <div>
        <h1>My Phaser Game</h1>
        <PhaserGame />
      </div>
    </main>
  );
}
