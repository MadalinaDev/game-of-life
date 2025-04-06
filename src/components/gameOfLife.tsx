"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { OptionsModal } from "@/components/ui/OptionsModal";
import {
  Play,
  Pause,
  StopCircle,
  Shuffle,
  Pencil,
  MousePointer,
  Settings,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { patterns } from "@/lib/patterns";


const GRID_SIZE = 50;
const CELL_SIZE = 12;

type GameState = {
  grid: boolean[][];
  ageGrid: number[][];
  generation: number;
};

const DEADLY_ZONE = {
  startRow: 15,
  endRow: 25,
  startCol: 15,
  endCol: 25,
};

const MIN_SPEED = 10;
const MAX_SPEED = 500;
const DEFAULT_SPEED = 100;

export default function GameOfLife() {
  const [gameState, setGameState] = useState<GameState>(() => ({
    grid: createEmptyGrid(),
    ageGrid: createEmptyAgeGrid(),
    generation: 0,
  }));

  const [isRunning, setIsRunning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [maxGenerations, setMaxGenerations] = useState(0);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [showOptions, setShowOptions] = useState(false);
  const [reverseTimeEnabled, setReverseTimeEnabled] = useState(true);
  const [reverseTimeInterval, setReverseTimeInterval] = useState(15);
  const [deadlyZoneEnabled, setDeadlyZoneEnabled] = useState(true);
  const [ageColoringEnabled, setAgeColoringEnabled] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runningRef = useRef(isRunning);

  useEffect(() => {
    runningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = GRID_SIZE * CELL_SIZE;
      canvas.height = GRID_SIZE * CELL_SIZE;
      drawGrid(gameState);
    }
  }, []);

  useEffect(() => {
    drawGrid(gameState);
  }, [gameState, ageColoringEnabled, deadlyZoneEnabled]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isRunning) {
      intervalId = setInterval(() => {
        if (runningRef.current) {
          setGameState((old) => {
            const newState = computeNextState(
                old,
                deadlyZoneEnabled,
                reverseTimeEnabled,
                reverseTimeInterval,
                ageColoringEnabled
            );
            if (maxGenerations > 0 && newState.generation >= maxGenerations) {
              setIsRunning(false);
            }
            return newState;
          });
        }
      }, speed);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    isRunning,
    speed,
    maxGenerations,
    deadlyZoneEnabled,
    reverseTimeEnabled,
    reverseTimeInterval,
    ageColoringEnabled,
  ]);

  function createEmptyGrid(): boolean[][] {
    return Array.from({ length: GRID_SIZE }, () =>
        Array<boolean>(GRID_SIZE).fill(false)
    );
  }

  function createEmptyAgeGrid(): number[][] {
    return Array.from({ length: GRID_SIZE }, () =>
        Array<number>(GRID_SIZE).fill(0)
    );
  }

  function computeNextState(
      old: GameState,
      deadlyZone: boolean,
      reverseTime: boolean,
      rtInterval: number,
      ageColors: boolean
  ): GameState {
    const { grid, ageGrid, generation } = old;
    const newGrid = createEmptyGrid();
    const newAge = createEmptyAgeGrid();

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const isAlive = grid[row][col];
        const neighbors = countNeighbors(grid, row, col);
        let nextAlive: boolean;

        const inDeadlyZone =
            deadlyZone &&
            row >= DEADLY_ZONE.startRow &&
            row < DEADLY_ZONE.endRow &&
            col >= DEADLY_ZONE.startCol &&
            col < DEADLY_ZONE.endCol;

        if (inDeadlyZone && isAlive && neighbors >= 3) {
          nextAlive = false;
        } else {
          nextAlive = conwayRule(isAlive, neighbors);
        }

        newGrid[row][col] = nextAlive;
        newAge[row][col] = nextAlive ? ageGrid[row][col] + 1 : 0;
      }
    }

    const nextGen = generation + 1;
    if (reverseTime && rtInterval > 0 && nextGen % rtInterval === 0) {
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          newGrid[row][col] = !newGrid[row][col];
          newAge[row][col] = newGrid[row][col] ? 1 : 0;
        }
      }
    }

    return {
      grid: newGrid,
      ageGrid: newAge,
      generation: nextGen,
    };
  }

  function conwayRule(isAlive: boolean, neighbors: number) {
    if (isAlive) {
      return neighbors === 2 || neighbors === 3;
    } else {
      return neighbors === 3;
    }
  }

  function countNeighbors(grid: boolean[][], x: number, y: number) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;

        const nx = (x + i + GRID_SIZE) % GRID_SIZE;
        const ny = (y + j + GRID_SIZE) % GRID_SIZE;
        if (grid[nx][ny]) count++;
      }
    }
    return count;
  }

  function getCellColor(age: number) {
    if (!ageColoringEnabled) {
      return "#000";
    }

    const cappedAge = age > 20 ? 20 : age;
    const startColor = { r: 192, g: 252, b: 188 };
    const endColor = { r: 0, g: 54, b: 0 };

    const factor = (cappedAge - 1) / 19;
    const r = Math.round(startColor.r + factor * (endColor.r - startColor.r));
    const g = Math.round(startColor.g + factor * (endColor.g - startColor.g));
    const b = Math.round(startColor.b + factor * (endColor.b - startColor.b));
    return `rgb(${r}, ${g}, ${b})`;
  }

  function drawGrid(state: GameState) {
    const { grid, ageGrid } = state;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const alive = grid[row][col];
        const age = ageGrid[row][col];

        if (!alive) {
          ctx.fillStyle = "#fff";
        } else {
          ctx.fillStyle = getCellColor(age);
        }

        if (
            deadlyZoneEnabled &&
            row >= DEADLY_ZONE.startRow &&
            row < DEADLY_ZONE.endRow &&
            col >= DEADLY_ZONE.startCol &&
            col < DEADLY_ZONE.endCol
        ) {
          ctx.strokeStyle = "rgba(255, 0, 0, 0.4)";
        } else {
          ctx.strokeStyle = "#ddd";
        }
        ctx.lineWidth = 0.5;

        ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  const { grid, ageGrid, generation } = gameState;

  function toggleRunning() {
    setIsRunning((prev) => !prev);
  }

  function resetGrid() {
    setGameState({
      grid: createEmptyGrid(),
      ageGrid: createEmptyAgeGrid(),
      generation: 0,
    });
    setIsRunning(false);
    setMaxGenerations(0);
  }

  function generateRandomGrid() {
    const newGrid = createEmptyGrid();
    const newAge = createEmptyAgeGrid();
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const alive = Math.random() > 0.7;
        newGrid[i][j] = alive;
        newAge[i][j] = alive ? 1 : 0;
      }
    }
    setGameState({
      grid: newGrid,
      ageGrid: newAge,
      generation: 0,
    });
  }

  function loadPattern(pattern: number[][]) {
    const newGrid = createEmptyGrid();
    const newAge = createEmptyAgeGrid();
    const centerX = Math.floor(GRID_SIZE / 2);
    const centerY = Math.floor(GRID_SIZE / 2);

    pattern.forEach(([x, y]) => {
      const nx = (centerX + x + GRID_SIZE) % GRID_SIZE;
      const ny = (centerY + y + GRID_SIZE) % GRID_SIZE;
      newGrid[nx][ny] = true;
      newAge[nx][ny] = 1;
    });

    setGameState({
      grid: newGrid,
      ageGrid: newAge,
      generation: 0,
    });
  }

  function handleCanvasMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    toggleCellUnderCursor(e);
  }

  function handleCanvasMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing || !e.buttons) return;
    toggleCellUnderCursor(e);
  }

  function toggleCellUnderCursor(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const col = Math.floor(((e.clientX - rect.left) * scaleX) / CELL_SIZE);
    const row = Math.floor(((e.clientY - rect.top) * scaleY) / CELL_SIZE);

    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      setGameState((old) => {
        const newGrid = old.grid.map((r) => [...r]);
        const newAge = old.ageGrid.map((r) => [...r]);

        const wasAlive = newGrid[row][col];
        const nowAlive = !wasAlive;
        newGrid[row][col] = nowAlive;
        newAge[row][col] = nowAlive ? 1 : 0;

        return {
          ...old,
          grid: newGrid,
          ageGrid: newAge,
        };
      });
    }
  }

  return (
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-xl font-bold mt-4">Conway's Game of Life - Toggles</h1>
        <p className="text-sm text-center max-w-lg">
          Adjust the toggles below to customize the rules.
          Use "Draw" mode to toggle cells, and "Run Until Generation" to stop automatically.
        </p>

        <div className="flex flex-wrap gap-2 justify-center mb-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                    variant={isRunning ? "destructive" : "default"}
                    onClick={toggleRunning}
                >
                  {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                  {isRunning ? "Pause" : "Start"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isRunning ? "Pause the simulation" : "Start the simulation"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="destructive" onClick={resetGrid}>
                  <StopCircle className="mr-2" />
                  Stop
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset the grid</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" onClick={generateRandomGrid}>
                  <Shuffle className="mr-2" />
                  Random
                </Button>
              </TooltipTrigger>
              <TooltipContent>Generate a random pattern</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                    variant={isDrawing ? "secondary" : "outline"}
                    onClick={() => setIsDrawing(!isDrawing)}
                >
                  {isDrawing ? (
                      <Pencil className="mr-2" />
                  ) : (
                      <MousePointer className="mr-2" />
                  )}
                  {isDrawing ? "Drawing" : "Draw"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isDrawing ? "Currently in drawing mode" : "Enable drawing mode"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-2">
          <Button variant="outline" onClick={() => loadPattern(patterns.stillLife)}>
            Still Life
          </Button>
          <Button variant="outline" onClick={() => loadPattern(patterns.deadEnd)}>
            Dead End
          </Button>
          <Button variant="outline" onClick={() => loadPattern(patterns.gliderGun)}>
            Glider Gun
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                    variant="outline"
                    onClick={() => setShowOptions(true)}
                >
                  <Settings className="mr-2" />
                  Options
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open game options</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {showOptions && (
            <OptionsModal onClose={() => setShowOptions(false)}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={reverseTimeEnabled}
                        onChange={(e) => setReverseTimeEnabled(e.target.checked)}
                    />
                    <span className="text-sm">Enable Reversing Time</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-sm whitespace-nowrap">Interval:</span>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        value={reverseTimeInterval}
                        onChange={(e) => setReverseTimeInterval(Number(e.target.value))}
                    />
                    <span className="text-sm">{reverseTimeInterval}</span>
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <input
                      type="checkbox"
                      checked={deadlyZoneEnabled}
                      onChange={(e) => setDeadlyZoneEnabled(e.target.checked)}
                  />
                  <span className="text-sm">Enable Deadly Zone</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                      type="checkbox"
                      checked={ageColoringEnabled}
                      onChange={(e) => setAgeColoringEnabled(e.target.checked)}
                  />
                  <span className="text-sm">Enable Age-Based Coloring</span>
                </label>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <label htmlFor="speedSlider" className="text-sm">Speed:</label>
                    <input
                        id="speedSlider"
                        type="range"
                        min={MIN_SPEED}
                        max={MAX_SPEED}
                        value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))}
                        className="w-full"
                    />
                  </div>
                  <span className="text-sm text-center">{speed} ms</span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <label htmlFor="maxGen" className="text-sm">
                      Run Until Generation:
                    </label>
                    <input
                        id="maxGen"
                        type="number"
                        min={0}
                        value={maxGenerations}
                        onChange={(e) => setMaxGenerations(Number(e.target.value))}
                        className="border rounded px-2 py-1 w-full text-sm"
                        placeholder="0 for infinite"
                    />
                  </div>
                </div>
              </div>
            </OptionsModal>
        )}

        <div className="text-sm my-2">Current Generation: {generation}</div>

        <div
            className={cn(
                "border border-gray-300 rounded overflow-hidden cursor-pointer",
                isDrawing && "cursor-crosshair"
            )}
        >
          <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              className="max-w-full"
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {isDrawing
              ? "Click/drag on cells to toggle them"
              : "Enable drawing mode to edit the grid"}
        </div>
      </div>
  );
}

function conwayRule(isAlive: boolean, neighbors: number): boolean {
  if (isAlive) {
    return neighbors === 2 || neighbors === 3;
  }
  return neighbors === 3;
}

function countNeighbors(grid: boolean[][], x: number, y: number): number {
  let count = 0;
  const size = grid.length;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const nx = (x + i + size) % size;
      const ny = (y + j + size) % size;
      if (grid[nx][ny]) count++;
    }
  }
  return count;
}

function createEmptyGrid(): boolean[][] {
  return Array.from({ length: GRID_SIZE }, () =>
      Array<boolean>(GRID_SIZE).fill(false)
  );
}

function createEmptyAgeGrid(): number[][] {
  return Array.from({ length: GRID_SIZE }, () =>
      Array<number>(GRID_SIZE).fill(0)
  );
}