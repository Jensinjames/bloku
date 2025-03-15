// Represents all 21 standard Blokus game pieces
// 1 = filled cell, 0 = empty cell

export type PieceShape = number[][];

export interface GamePiece {
  id: number;
  name: string;
  shape: PieceShape;
  size: number; // Number of squares
  used?: boolean;
}

// All 21 Blokus pieces
export const BLOKUS_PIECES: GamePiece[] = [
  // Monomino (1 square)
  {
    id: 1,
    name: 'Monomino',
    shape: [[1]],
    size: 1,
  },
  
  // Domino (2 squares in a row)
  {
    id: 2,
    name: 'Domino',
    shape: [[1, 1]],
    size: 2,
  },
  
  // Straight Tromino (3 squares in a row)
  {
    id: 3,
    name: 'Straight Tromino',
    shape: [[1, 1, 1]],
    size: 3,
  },
  
  // L-Tromino (2 squares in a row with 1 square at the end)
  {
    id: 4,
    name: 'L-Tromino',
    shape: [
      [1, 0],
      [1, 1],
    ],
    size: 3,
  },
  
  // Straight Tetromino (4 squares in a row)
  {
    id: 5,
    name: 'Straight Tetromino',
    shape: [[1, 1, 1, 1]],
    size: 4,
  },
  
  // Square Tetromino (2x2 square)
  {
    id: 6,
    name: 'Square Tetromino',
    shape: [
      [1, 1],
      [1, 1],
    ],
    size: 4,
  },
  
  // T-Tetromino (3 squares in a row with 1 in the middle)
  {
    id: 7,
    name: 'T-Tetromino',
    shape: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    size: 4,
  },  // L-Tetromino (proper L shape with 4 blocks)
  {
    id: 8,
    name: 'L-Tetromino',
    shape: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    size: 4,
  },
  
  // Z-Tetromino (zig-zag shape)
  {
    id: 9,
    name: 'Z-Tetromino',
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    size: 4,
  },
  
  // S-Tetromino (like Z-Tetromino, but flipped)
  {
    id: 10,
    name: 'S-Tetromino',
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    size: 4,
  },
  
  // Straight Pentomino (5 squares in a row)
  {
    id: 11,
    name: 'I-Pentomino',
    shape: [[1, 1, 1, 1, 1]],
    size: 5,
  },
  
  // T-Pentomino
  {
    id: 12,
    name: 'T-Pentomino',
    shape: [
      [1, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    size: 5,
  },
  
  // U-Pentomino
  {
    id: 13,
    name: 'U-Pentomino',
    shape: [
      [1, 0, 1],
      [1, 1, 1],
    ],
    size: 5,
  },
  
  // V-Pentomino
  {
    id: 14,
    name: 'V-Pentomino',
    shape: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
    size: 5,
  },
  
  // W-Pentomino
  {
    id: 15,
    name: 'W-Pentomino',
    shape: [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    size: 5,
  },
  
  // X-Pentomino (+ shape)
  {
    id: 16,
    name: 'X-Pentomino',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    size: 5,
  },
  
  // Y-Pentomino
  {
    id: 17,
    name: 'Y-Pentomino',
    shape: [
      [0, 1, 0, 0],
      [1, 1, 1, 1],
    ],
    size: 5,
  },
  
  // Z-Pentomino
  {
    id: 18,
    name: 'Z-Pentomino',
    shape: [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    size: 5,
  },
  
  // F-Pentomino
  {
    id: 19,
    name: 'F-Pentomino',
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 1, 0],
    ],
    size: 5,
  },
  
  // P-Pentomino
  {
    id: 20,
    name: 'P-Pentomino',
    shape: [
      [1, 1],
      [1, 1],
      [1, 0],
    ],
    size: 5,
  },
  
  // N-Pentomino (also called R-Pentomino)
  {
    id: 21,
    name: 'N-Pentomino',
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [1, 0, 0],
    ],
    size: 5,
  },
];

// Utility functions for piece manipulation
export function rotatePiece(piece: PieceShape, rotation: number): PieceShape {
  let result = [...piece.map(row => [...row])];
  const rotations = (rotation / 90) % 4;
  
  for (let i = 0; i < rotations; i++) {
    result = rotateClockwise(result);
  }
  
  return result;
}

export function flipPiece(piece: PieceShape, horizontal: boolean = true): PieceShape {
  if (horizontal) {
    return piece.map(row => [...row].reverse());
  } else {
    return [...piece].reverse();
  }
}

function rotateClockwise(matrix: number[][]): number[][] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result: number[][] = Array(cols).fill(0).map(() => Array(rows).fill(0));
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[c][rows - 1 - r] = matrix[r][c];
    }
  }
  
  return result;
}

// Function to transform a piece based on rotation and flip
export function transformPiece(
  piece: PieceShape, 
  rotation: number = 0, 
  flipped: boolean = false
): PieceShape {
  if (!piece || piece.length === 0 || !piece[0] || piece[0].length === 0) {
    console.log(`transformPiece received an invalid piece: ${JSON.stringify(piece)}`);
    return piece;
  }
  let transformed = piece.map(row => [...row]);
  if (flipped) {
    transformed = flipPiece(transformed);
  }
  if (rotation !== 0) {
    transformed = rotatePiece(transformed, rotation);
  }
  console.log(`transformPiece: rotation = ${rotation}, flipped = ${flipped}, original: ${JSON.stringify(piece)}, transformed: ${JSON.stringify(transformed)}`);
  return transformed;
}

// Function to get piece dimensions after transformation
export function getPieceDimensions(piece: PieceShape): { width: number; height: number } {
  return {
    width: piece[0].length,
    height: piece.length
  };
}