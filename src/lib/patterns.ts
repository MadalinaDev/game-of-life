// Patterns for Conway's Game of Life
// Each pattern is an array of [x, y] coordinates relative to the center of the grid

export const patterns = {
  // Block (2x2) - a still life pattern that doesn't change
  stillLife: [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1], // Block
    [3, 0],
    [3, 1],
    [4, 0],
    [4, 1], // Block
    [-3, -3],
    [-3, -2],
    [-2, -3],
    [-2, -2], // Block
  ],

  // Pattern that quickly reaches a dead end (all cells die)
  deadEnd: [
    [0, 0],
    [0, 1],
    [0, 2], // Simple vertical line (will oscillate once then die)
  ],

  // Gosper Glider Gun - creates a stream of gliders
  gliderGun: [
    [0, -4],
    [0, -3],
    [1, -4],
    [1, -3], // Block
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
};
