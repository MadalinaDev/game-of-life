# 🌱 Conway's Game of Life – React + TypeScript + Canvas

A feature-rich simulation of **Conway's Game of Life**, reimagined with modern frontend tools. This version offers not only classic cell evolution rules but also custom enhancements such as time reversal, deadly zones, drawing mode, color themes, and smart simulation history logging.

> _"The Game of Life, also known simply as Life, is a cellular automaton devised by the British mathematician John Horton Conway in 1970."_ – Wikipedia

---

## 🎮 Gameplay Summary

In this zero-player game, you define an initial configuration of cells (live or dead), then press start and watch as they evolve through generations according to a fixed set of rules:

### 🔁 Rules of Life:

1. A live cell with **2 or 3** neighbors survives.
2. A dead cell with **exactly 3** live neighbors becomes alive.
3. All other live cells **die** in the next generation (from under/overpopulation).
4. All other dead cells **stay dead**.

---

## 🧠 Custom Features

| Feature                   | Description                                                                 |
|---------------------------|-----------------------------------------------------------------------------|
| 🧱 Drawing Mode           | Click or drag to manually activate/deactivate cells                         |
| 💥 Deadly Zone            | A square area that kills overpopulated cells (custom rule zone)             |
| 🔄 Time Reversal          | Every X generations, the board inverts (live ↔ dead)                        |
| 🎨 Color Themes           | Classic greens, rainbow hues, or heatmap gradients by age                   |
| 🧬 Pattern Loader         | Load built-in patterns (Glider, Still Life, R-Pentomino, etc.)              |
| 🕰️ Speed Control         | Tune simulation from blazing fast to slow motion                            |
| ⏳ Max Generation Limit   | Automatically stop simulation at a given generation                         |
| 📜 Generation History     | Logs cause + result + generation + runtime duration                         |


---

## 🚀 Live Demo

You can try the app here locally,but soon will also be available online
🔗 [ http://localhost:3000]( http://localhost:3000)

---

## 🧰 Tech Stack

- **Framework**: [Next.js](https://nextjs.org)
- **Language**: TypeScript
- **Rendering**: HTML5 Canvas
- **Icons/UI**: Lucide, TailwindCSS, ShadCN UI
- **State**: React Hooks (`useState`, `useEffect`, `useRef`)
- **Deployment**: Vercel

---

## 🛠 Getting Started

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### 1. Clone the repository:

```bash
git clone https://github.com/your-username/game-of-life
cd game-of-life
```
### 2. Install dependencies:
```bash
npm install
# or
yarn
# or
pnpm install
```
### 3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
