"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  StopCircle,
  Shuffle,
  Pencil,
  MousePointer,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Save,
  Info,
} from "lucide-react";
import { Upload as Load } from "lucide-react";
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
  const [reverseTimeEnabled, setReverseTimeEnabled] = useState(true);
  const [reverseTimeInterval, setReverseTimeInterval] = useState(15);
  const [deadlyZoneEnabled, setDeadlyZoneEnabled] = useState(true);
  const [ageColoringEnabled, setAgeColoringEnabled] = useState(true);
  const [drawMode, setDrawMode] = useState<'single' | 'continuous'>('continuous');
  const [patternRotation, setPatternRotation] = useState(0);
  const [patternFlip, setPatternFlip] = useState<'none' | 'horizontal' | 'vertical'>('none');
  const [colorTheme, setColorTheme] = useState<'classic' | 'rainbow' | 'heatmap'>('classic');
  type HistoryEntry = {
    cause: string;        
    result: string;       
    generation: number;
    duration: string;
  };
  const [currentCause, setCurrentCause] = useState<string | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runningRef = useRef(isRunning);
  const lastDrawnCell = useRef<[number, number] | null>(null);
  function setCauseAndStartTimer(cause: string) {
    setCurrentCause(cause);
    startTimeRef.current = Date.now(); // reset timer
  }
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
  }, [gameState, ageColoringEnabled, deadlyZoneEnabled, colorTheme]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isRunning) {
      intervalId = setInterval(() => {
        if (runningRef.current) {
          setGameState((old) => {
            const { newState, isExtinct } = computeNextState(
              old,
              deadlyZoneEnabled,
              reverseTimeEnabled,
              reverseTimeInterval,
              ageColoringEnabled
            );
            
    
            if (maxGenerations > 0 && newState.generation >= maxGenerations) {
              setIsRunning(false);
              logHistory("Reached Max Generation", newState.generation); // ✅ pass generation
            }
    
            if (isExtinct) {
              setIsRunning(false);
              logHistory("Extinction", newState.generation); // ✅ pass generation
            }
    
            return newState;
          });
        }
      }, speed);
    }
    

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, speed, maxGenerations, deadlyZoneEnabled, reverseTimeEnabled, reverseTimeInterval, ageColoringEnabled]);

  function createEmptyGrid(): boolean[][] {
    return Array.from({ length: GRID_SIZE }, () =>
        Array<boolean>(GRID_SIZE).fill(false)
    );
  }
  function logHistory(result: string, generation: number) {
    const now = Date.now();
    let duration = "00:00";
  
    if (startTimeRef.current) {
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      duration = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    if (duration === "00:00") return;

    setHistory((prev) => [
      {
        cause: currentCause || "Unknown",
        result,
        generation,
        duration,
      },
      ...prev,
    ]);
  
    startTimeRef.current = now;
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
  ): { newState: GameState; isExtinct: boolean }  {
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
    const isExtinct = newGrid.flat().every((cell) => !cell);

    return {
      newState: {
        grid: newGrid,
        ageGrid: newAge,
        generation: nextGen,
      },
      isExtinct,
    };
  }

  function getCellColor(age: number) {
    if (!ageColoringEnabled) {
      return "#000";
    }

    const cappedAge = age > 20 ? 20 : age;

    switch (colorTheme) {
      case 'rainbow':
        return `hsl(${(cappedAge * 18) % 360}, 100%, 50%)`;
      case 'heatmap':
        const intensity = Math.min(cappedAge / 20, 1);
        return `rgb(${Math.floor(255 * intensity)}, ${Math.floor(255 * (1 - intensity))}, 0)`;
      case 'classic':
      default:
        const startColor = { r: 192, g: 252, b: 188 };
        const endColor = { r: 0, g: 54, b: 0 };
        const factor = (cappedAge - 1) / 19;
        return `rgb(${
            Math.round(startColor.r + factor * (endColor.r - startColor.r))
        }, ${
            Math.round(startColor.g + factor * (endColor.g - startColor.g))
        }, ${
            Math.round(startColor.b + factor * (endColor.b - startColor.b))
        })`;
    }
  }

  function drawGrid(state: GameState) {
    const { grid, ageGrid } = state;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
          ctx.strokeStyle = "rgba(255, 0, 0, 0.2)";
        } else {
          ctx.strokeStyle = "#eee";
        }
        ctx.lineWidth = 0.5;

        ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }

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
    setCauseAndStartTimer("Random Grid");
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

  function loadPattern(pattern: number[][], label: string) {
    setCauseAndStartTimer(label);
  
    const newGrid = createEmptyGrid();
    const newAge = createEmptyAgeGrid();
    const centerX = Math.floor(GRID_SIZE / 2);
    const centerY = Math.floor(GRID_SIZE / 2);
  
    const transformedPattern = pattern.map(([x, y]) => {
      let newX = x;
      let newY = y;
  
      if (patternRotation !== 0) {
        const radians = (patternRotation * Math.PI) / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        [newX, newY] = [
          Math.round(x * cos - y * sin),
          Math.round(x * sin + y * cos)
        ];
      }
  
      if (patternFlip === 'horizontal') newX = -newX;
      if (patternFlip === 'vertical') newY = -newY;
  
      return [newX, newY];
    });
  
    transformedPattern.forEach(([x, y]) => {
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
  
  function saveGrid() {
    localStorage.setItem('savedGrid', JSON.stringify(gameState.grid));
  }

  function loadGrid() {
    const saved = localStorage.getItem('savedGrid');
    if (saved) {
      const loadedGrid = JSON.parse(saved);
      setGameState({
        grid: loadedGrid,
        ageGrid: createEmptyAgeGrid(),
        generation: 0,
      });
    }
  }

  function handleCanvasMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    toggleCellUnderCursor(e);
  }

  function handleCanvasMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing || !e.buttons || drawMode === 'single') return;
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
      if (lastDrawnCell.current &&
          lastDrawnCell.current[0] === row &&
          lastDrawnCell.current[1] === col) {
        return;
      }

      lastDrawnCell.current = [row, col];

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

  function handleTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    handleCanvasMouseDown(mouseEvent as unknown as React.MouseEvent<HTMLCanvasElement>);
  }

  function handleTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawing || e.touches.length === 0) return;
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY,
      buttons: 1,
    });
    handleCanvasMouseMove(mouseEvent as unknown as React.MouseEvent<HTMLCanvasElement>);
  }

  return (
      <div className="flex flex-col items-center gap-6 w-full">
        <header className="w-full py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary bg-clip-text text-transparent bg-gray-800">
              Conway's Game of Life
            </h1>
            <div className="relative group">
              <Button variant="ghost" size="icon" className="size-8 text-grey-100 hover:bg-grey-10">
                <Info className="size-4"/>
              </Button>
              <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <p className="text-sm text-gray-700">
                  Adjust the toggles below to customize the rules. Use "Draw" mode to toggle cells, and "Run Until
                  Generation" to stop automatically.
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="w-full flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col gap-4 w-full lg:w-auto">
            <div className="glass-panel p-4 flex flex-col gap-4">
              <div className="flex flex-wrap gap-2 justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                          variant={isRunning ? "destructive" : "default"}
                          onClick={toggleRunning}
                          className="control-button w-24"
                      >
                        {isRunning ? <Pause className="size-4 mr-2" /> : <Play className="size-4 mr-2" />}
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
                      <Button
                          variant="destructive"
                          onClick={resetGrid}
                          className="control-button"
                      >
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
                      <Button
                          variant="secondary"
                          onClick={generateRandomGrid}
                          className="control-button"
                      >
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
                          className="control-button w-26"
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

              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                    variant="outline"
                    onClick={() => loadPattern(patterns.stillLife, "Still Life")}
                    className="pattern-button"
                >
                  Still Life
                </Button>
                <Button
                    variant="outline"
                    onClick={() => loadPattern(patterns.blinker, "Blinker")}
                    className="pattern-button"
                >
                  Blinker
                </Button>
                <Button
                    variant="outline"
                    onClick={() => loadPattern(patterns.glider, "Glider")}
                    className="pattern-button"
                >
                  Glider
                </Button>
                <Button
                    variant="outline"
                    onClick={() => loadPattern(patterns.gliderGun,  "Glider Gun")}
                    className="pattern-button"
                >
                  Glider Gun
                </Button>
                <Button
                    variant="outline"
                    onClick={() => loadPattern(patterns.beacon, "Beacon")}
                    className="pattern-button"
                >
                  Beacon
                </Button>
                <Button
                    variant="outline"
                    onClick={() => loadPattern(patterns.toad, "Toad")}
                    className="pattern-button"
                >
                  Toad
                </Button>
                <Button
                    variant="outline"
                    onClick={() => loadPattern(patterns.rPentomino, "R-Pentomino")}
                    className="pattern-button"
                >
                  R-Pentomino
                </Button>
                <Button
                    variant="outline"
                    onClick={() => loadPattern(patterns.LWSS, "LWSS")}
                    className="pattern-button"
                >
                  LWSS
                </Button>
                <Button
                    variant="outline"
                    onClick={() => loadPattern(patterns.PULSAR, "PULSAR")}
                    className="pattern-button"
                >
                  Pulsar
                </Button>
                <Button
                    variant="outline"
                    onClick={() => loadPattern(patterns.DIEHARD, "DIEHARD")}
                    className="pattern-button"
                >
                  Diehard
                </Button>
              </div>

            </div>

            <div className="glass-panel p-3 text-center">
              <div className="text-sm font-medium text-muted-foreground">Generation</div>
              <div className="text-2xl font-bold text-primary">{gameState.generation}</div>
            </div>
            

            <div className="glass-panel p-4 flex flex-col gap-2">
              <h3 className="font-semibold text-m text-center">Game Options</h3>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input
                      type="checkbox"
                      checked={reverseTimeEnabled}
                      onChange={(e) => setReverseTimeEnabled(e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
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
                      className="w-full accent-primary"
                  />
                  <span className="text-sm">{reverseTimeInterval}</span>
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={deadlyZoneEnabled}
                    onChange={(e) => setDeadlyZoneEnabled(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                />
                <span className="text-sm">Enable Deadly Zone</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={ageColoringEnabled}
                    onChange={(e) => setAgeColoringEnabled(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                />
                <span className="text-sm">Enable Age-Based Coloring</span>
              </label>

              <div className="flex flex-col gap-2">
                <label className="text-sm">Color Theme:</label>
                <div className="flex gap-2">
                  <Button
                      variant={colorTheme === 'classic' ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setColorTheme('classic')}
                  >
                    Classic
                  </Button>
                  <Button
                      variant={colorTheme === 'rainbow' ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setColorTheme('rainbow')}
                  >
                    Rainbow
                  </Button>
                  <Button
                      variant={colorTheme === 'heatmap' ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setColorTheme('heatmap')}
                  >
                    Heatmap
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm">Drawing Mode:</label>
                <div className="flex gap-2">
                  <Button
                      variant={drawMode === 'single' ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setDrawMode('single')}
                  >
                    Single Cell
                  </Button>
                  <Button
                      variant={drawMode === 'continuous' ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setDrawMode('continuous')}
                  >
                    Continuous
                  </Button>
                </div>
              </div>

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
                      className="w-full accent-primary"
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
                      className="border rounded px-2 py-1 w-full text-sm focus:ring-primary focus:border-primary"
                      placeholder="0 for infinite"
                  />
                </div>
              </div>
            </div>
            <div className="glass-panel p-4 max-h-64 overflow-auto">
            <h3 className="text-sm font-semibold text-center mb-2 text-muted-foreground">Generation History</h3>

            <ul className="text-sm space-y-1">
  {history.map((entry, index) => (
    <li key={index} className="text-muted-foreground">
      <strong>{entry.cause}</strong> → {entry.result} @ Gen {entry.generation} — {entry.duration}
    </li>
  ))}
</ul>

</div>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <div
                className={cn(
                    "glass-panel p-2 border-2",
                    isDrawing ? "border-primary/50" : "border-transparent"
                )}
            >
              <div className="relative">
                <canvas
                    ref={canvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    className="rounded-lg shadow-inner bg-white dark:bg-gray-900"
                />
                {deadlyZoneEnabled && (
                    <div
                        className="absolute border-2 border-red-400/30 pointer-events-none"
                        style={{
                          left: `${DEADLY_ZONE.startCol * CELL_SIZE}px`,
                          top: `${DEADLY_ZONE.startRow * CELL_SIZE}px`,
                          width: `${(DEADLY_ZONE.endCol - DEADLY_ZONE.startCol) * CELL_SIZE}px`,
                          height: `${(DEADLY_ZONE.endRow - DEADLY_ZONE.startRow) * CELL_SIZE}px`,
                        }}
                    />
                )}
              </div>
            </div>
          </div>
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