// Each piece is defined as a 2D array where 1 represents a filled cell
export interface BlokusPiece {
  id: number;
  name: string;
  shape: number[][];
  cells: number; // Number of cells in the piece
}

export const BLOKUS_PIECES: BlokusPiece[] = [
  // 1 cell (Monomino)
  {
    id: 1,
    name: "Single",
    shape: [[1]],
    cells: 1
  },
  
  // 2 cells (Domino)
  {
    id: 2,
    name: "Domino",
    shape: [[1, 1]],
    cells: 2
  },
  
  // 3 cells (Trominoes)
  {
    id: 3,
    name: "Straight3",
    shape: [[1, 1, 1]],
    cells: 3
  },
  {
    id: 4,
    name: "Corner3",
    shape: [
      [1, 1],
      [1, 0]
    ],
    cells: 3
  },
  
  // 4 cells (Tetrominoes)
  {
    id: 5,
    name: "Straight4",
    shape: [[1, 1, 1, 1]],
    cells: 4
  },
  {
    id: 6,
    name: "Square",
    shape: [
      [1, 1],
      [1, 1]
    ],
    cells: 4
  },
  {
    id: 7,
    name: "T4",
    shape: [
      [1, 1, 1],
      [0, 1, 0]
    ],
    cells: 4
  },
  {
    id: 8,
    name: "L4",
    shape: [
      [1, 1, 1],
      [1, 0, 0]
    ],
    cells: 4
  },
  {
    id: 9,
    name: "Z4",
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    cells: 4
  },
  
  // 5 cells (Pentominoes)
  {
    id: 10,
    name: "Straight5",
    shape: [[1, 1, 1, 1, 1]],
    cells: 5
  },
  {
    id: 11,
    name: "L5",
    shape: [
      [1, 1, 1, 1],
      [1, 0, 0, 0]
    ],
    cells: 5
  },
  {
    id: 12,
    name: "T5",
    shape: [
      [1, 1, 1],
      [0, 1, 0],
      [0, 1, 0]
    ],
    cells: 5
  },
  {
    id: 13,
    name: "V5",
    shape: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1]
    ],
    cells: 5
  },
  {
    id: 14,
    name: "N5",
    shape: [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 1]
    ],
    cells: 5
  },
  {
    id: 15,
    name: "Z5",
    shape: [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 1]
    ],
    cells: 5
  },
  {
    id: 16,
    name: "Plus",
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0]
    ],
    cells: 5
  },
  {
    id: 17,
    name: "H5",
    shape: [
      [1, 0, 1],
      [1, 1, 1],
      [1, 0, 1]
    ],
    cells: 5
  },
  {
    id: 18,
    name: "F5",
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 1, 0]
    ],
    cells: 5
  },
  {
    id: 19,
    name: "I5",
    shape: [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 1]
    ],
    cells: 5
  },
  {
    id: 20,
    name: "P5",
    shape: [
      [1, 1],
      [1, 1],
      [1, 0]
    ],
    cells: 5
  },
  {
    id: 21,
    name: "W5",
    shape: [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 1]
    ],
    cells: 5
  }
];

// Helper functions for piece manipulation
export const rotatePiece = (shape: number[][]): number[][] => {
  const N = shape.length;
  const M = shape[0].length;
  const rotated = Array(M).fill(0).map(() => Array(N).fill(0));
  
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      rotated[j][N - 1 - i] = shape[i][j];
    }
  }
  
  return rotated;
};

export const flipPiece = (shape: number[][]): number[][] => {
  return shape.map(row => [...row].reverse());
};

// Get all possible orientations of a piece
export const getAllOrientations = (piece: BlokusPiece): number[][][] => {
  const orientations: number[][][] = [];
  let current = piece.shape;
  
  // Get all rotations
  for (let i = 0; i < 4; i++) {
    orientations.push(current);
    current = rotatePiece(current);
  }
  
  // Get all flipped rotations
  current = flipPiece(piece.shape);
  for (let i = 0; i < 4; i++) {
    orientations.push(current);
    current = rotatePiece(current);
  }
  
  // Remove duplicates
  return orientations.filter((orientation, index) => {
    const stringified = JSON.stringify(orientation);
    return orientations.findIndex(o => JSON.stringify(o) === stringified) === index;
  });
};