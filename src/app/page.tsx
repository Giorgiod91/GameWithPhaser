import Link from "next/link";

import dynamic from "next/dynamic";
const PhaserGame = dynamic(() => import("../app/components/PhaserGame"), {
  ssr: false,
});
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col text-white">
      <section className="h-screen">
        <PhaserGame />
      </section>
    </main>
  );
}
