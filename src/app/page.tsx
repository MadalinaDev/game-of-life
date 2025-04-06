import GameOfLife from "@/components/gameOfLife";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1 flex flex-col items-center p-4 md:p-8">
                <div className="w-full max-w-6xl mx-auto glass-panel p-4 md:p-6">
                    <GameOfLife />
                </div>
            </main>
            <footer className="w-full py-4 text-center bg-secondary text-secondary-foreground">
                <p className="text-sm">
                    Created by Blîndu Andi, Caraman Mihai, Chirpicinic Mădălina, Iachim Diana, Popescu Sabina, team FAF-233
                </p>
            </footer>
        </div>
    );
}