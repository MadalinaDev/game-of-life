// Patterns for Conway's Game of Life
// Each pattern is an array of [x, y] coordinates relative to the center of the grid

export const patterns = {
  // Block (2x2) - a still life pattern that doesn't change
  stillLife: [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
    [3, 0],
    [3, 1],
    [4, 0],
    [4, 1],
    [-3, -3],
    [-3, -2],
    [-2, -3],
    [-2, -2],
  ],

  // Pattern that quickly dies
  deadEnd: [
    [0, 0],
    [0, 1],
    [0, 2],
  ],

  // Gosper Glider Gun
  gliderGun: [
    [0, -4],
    [0, -3],
    [1, -4],
    [1, -3],
    [10, -4],
    [10, -3],
    [10, -2],
    [11, -5],
    [11, -1],
    [12, -6],
    [12, 0],
    [13, -6],
    [13, 0],
    [14, -3],
    [15, -5],
    [15, -1],
    [16, -4],
    [16, -3],
    [16, -2],
    [17, -3],
    [20, -6],
    [20, -5],
    [20, -4],
    [21, -6],
    [21, -5],
    [21, -4],
    [22, -7],
    [22, -3],
    [24, -7],
    [24, -3],
    [24, -2],
    [24, -8],
    [34, -5],
    [34, -4],
    [35, -5],
    [35, -4],
  ],

  // New patterns added
  blinker: [
    [0, 0],
    [0, 1],
    [0, 2],
  ],

  glider: [
    [0, 0],
    [1, 1],
    [2, 1],
    [0, 2],
    [1, 2],
  ],

  beacon: [
    [0, 0],
    [0, 1],
    [1, 0],
    [2, 3],
    [3, 2],
    [3, 3],
  ],

  toad: [
    [1, 0],
    [2, 0],
    [3, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],

  rPentomino: [
    [0, 1],
    [1, 1],
    [1, 0],
    [1, 2],
    [2, 0],
  ],

  DIEHARD: [
    [7, 0],
    [1, 1], [2, 1],
    [2, 2],
    [6, 2], [7, 2], [8, 2],
  ],

  LWSS: [
    [1, 0], [4, 0],
    [0, 1], [0, 2],
    [4, 1], [4, 2],
    [1, 3], [2, 3], [3, 3], [4, 3],
  ],

  PULSAR: [
    [2, 0], [3, 0], [4, 0], [8, 0], [9, 0], [10, 0],
    [0, 2], [5, 2], [7, 2], [12, 2],
    [0, 3], [5, 3], [7, 3], [12, 3],
    [0, 4], [5, 4], [7, 4], [12, 4],
    [2, 5], [3, 5], [4, 5], [8, 5], [9, 5], [10, 5],
  
    [2, 7], [3, 7], [4, 7], [8, 7], [9, 7], [10, 7],
    [0, 8], [5, 8], [7, 8], [12, 8],
    [0, 9], [5, 9], [7, 9], [12, 9],
    [0, 10], [5, 10], [7, 10], [12, 10],
    [2, 12], [3, 12], [4, 12], [8, 12], [9, 12], [10, 12],
  ],
};