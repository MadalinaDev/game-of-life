import GameOfLife from "@/components/gameOfLife";

export default function Home() {
  return (
    <>
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Conway's Game of Life</h1>
      <GameOfLife />
    </main>
    <footer className="w-full p-4 text-center bg-gray-100">
        <p>Created by Blîndu Andi, Caraman Mihai, Chirpicinic Mădălina, Iachim Diana, Popescu Sabina, team of FAF-233.</p>
      </footer>
    </>
  );
}
