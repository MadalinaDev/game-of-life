"use client";

import type React from "react";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  StopCircle,
  Shuffle,
  Pencil,
  MousePointer,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { patterns } from "@/lib/patterns";

const GRID_SIZE = 100;
const CELL_SIZE = 8;
const GAME_SPEED = 100; // ms

export default function GameOfLife() {
  const [grid, setGrid] = useState<boolean[][]>(() => createEmptyGrid());
  const [isRunning, setIsRunning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const runningRef = useRef(isRunning);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generation, setGeneration] = useState(0);

  // Update the ref when isRunning changes
  useEffect(() => {
    runningRef.current = isRunning;
  }, [isRunning]);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = GRID_SIZE * CELL_SIZE;
      canvas.height = GRID_SIZE * CELL_SIZE;
      drawGrid();
    }
  }, []);

  // Draw the grid whenever it changes
  useEffect(() => {
    drawGrid();
  }, [grid]);

  // Game simulation loop
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning) {
      intervalId = setInterval(() => {
        if (runningRef.current) {
          setGrid((g) => computeNextGeneration(g));
          setGeneration((prev) => prev + 1);
        }
      }, GAME_SPEED);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning]);

  // Create an empty grid
  function createEmptyGrid() {
    return Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(false));
  }

  // Compute the next generation based on Conway's Game of Life rules
  const computeNextGeneration = useCallback((grid: boolean[][]) => {
    const newGrid = createEmptyGrid();

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const neighbors = countNeighbors(grid, i, j);

        if (grid[i][j]) {
          // Cell is alive
          newGrid[i][j] = neighbors === 2 || neighbors === 3;
        } else {
          // Cell is dead
          newGrid[i][j] = neighbors === 3;
        }
      }
    }

    return newGrid;
  }, []);

  // Count the number of live neighbors for a cell
  function countNeighbors(grid: boolean[][], x: number, y: number) {
    let count = 0;

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;

        const newX = (x + i + GRID_SIZE) % GRID_SIZE;
        const newY = (y + j + GRID_SIZE) % GRID_SIZE;

        if (grid[newX][newY]) count++;
      }
    }

    return count;
  }

  // Draw the grid on the canvas
  function drawGrid() {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the cells
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        ctx.fillStyle = grid[i][j] ? "#000" : "#fff";
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 0.5;

        ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  // Generate a random grid
  function generateRandomGrid() {
    const newGrid = createEmptyGrid();

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        newGrid[i][j] = Math.random() > 0.7;
      }
    }

    setGrid(newGrid);
    setGeneration(0);
  }

  // Reset the grid
  function resetGrid() {
    setGrid(createEmptyGrid());
    setIsRunning(false);
    setGeneration(0);
  }

  // Toggle the game state (pause/continue)
  function toggleRunning() {
    setIsRunning(!isRunning);
  }

  // Load a preset pattern
  function loadPattern(pattern: number[][]) {
    const newGrid = createEmptyGrid();
    const centerX = Math.floor(GRID_SIZE / 2);
    const centerY = Math.floor(GRID_SIZE / 2);

    pattern.forEach(([x, y]) => {
      const newX = (centerX + x + GRID_SIZE) % GRID_SIZE;
      const newY = (centerY + y + GRID_SIZE) % GRID_SIZE;
      newGrid[newX][newY] = true;
    });

    setGrid(newGrid);
    setGeneration(0);
  }

  // Handle mouse events for drawing
  function handleCanvasMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor(((e.clientX - rect.left) * scaleX) / CELL_SIZE);
    const y = Math.floor(((e.clientY - rect.top) * scaleY) / CELL_SIZE);

    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      const newGrid = [...grid];
      newGrid[y][x] = !newGrid[y][x];
      setGrid(newGrid);
    }
  }

  function handleCanvasMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing || !e.buttons) return;
    handleCanvasMouseDown(e);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isRunning ? "destructive" : "default"}
                onClick={toggleRunning}
              >
                {isRunning ? (
                  <Pause className="mr-2" />
                ) : (
                  <Play className="mr-2" />
                )}
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

      <div className="flex flex-wrap gap-2 justify-center mb-4">
        <Button
          variant="outline"
          onClick={() => loadPattern(patterns.stillLife)}
        >
          Still Life
        </Button>
        <Button variant="outline" onClick={() => loadPattern(patterns.deadEnd)}>
          Dead End
        </Button>
        <Button
          variant="outline"
          onClick={() => loadPattern(patterns.gliderGun)}
        >
          Glider Gun
        </Button>
      </div>

      <div className="text-sm mb-2">Generation: {generation}</div>

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

      <div className="text-xs text-gray-500 mt-2">
        {isDrawing
          ? "Click on cells to toggle them"
          : "Enable drawing mode to edit the grid"}
      </div>
    </div>
  );
}
