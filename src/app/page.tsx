import GameOfLife from "@/components/gameOfLife";


export default function Home() {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-6xl w-full space-y-6">
          <h1 className="text-3xl font-bold text-center text-gray-800">
            Conway’s Game of Life
          </h1>
           <GameOfLife />
          <footer className="w-full py-4 text-center bg-secondary text-secondary-foreground">
                <p className="text-sm">
                    Created by Blîndu Andi, Caraman Mihai, Chirpicinic Mădălina, Iachim Diana, Popescu Sabina, team FAF-233
                </p>
            </footer>
        </div>
      </main>
    );
  }
  