import { transformPiece } from '../components/GamePieces';

describe('transformPiece function', () => {
  it('should return the original T-Tetromino when rotation = 0 and flipped = false', () => {
    const tPiece = [
      [1, 1, 1],
      [0, 1, 0],
    ];
    const result = transformPiece(tPiece, 0, false);
    expect(result).toEqual(tPiece);
  });

  it('should correctly rotate T-Tetromino by 90 degrees', () => {
    const tPiece = [
      [1, 1, 1],
      [0, 1, 0],
    ];
    // Expected rotated T-Tetromino (clockwise):
    // [
    //   [0, 1],
    //   [1, 1],
    //   [0, 1],
    // ]
    const expected = [
      [0, 1],
      [1, 1],
      [0, 1],
    ];
    const result = transformPiece(tPiece, 90, false);
    expect(result).toEqual(expected);
  });

  it('should return the same T-Tetromino when flipped horizontally (due to symmetry)', () => {
    const tPiece = [
      [1, 1, 1],
      [0, 1, 0],
    ];
    const result = transformPiece(tPiece, 0, true);
    expect(result).toEqual(tPiece);
  });

  it('should return the original L-Tetromino when rotation = 0 and flipped = false', () => {
    const lPiece = [
      [1, 0],
      [1, 0],
      [1, 1],
    ];
    const result = transformPiece(lPiece, 0, false);
    expect(result).toEqual(lPiece);
  });

  it('should correctly rotate L-Tetromino by 90 degrees', () => {
    const lPiece = [
      [1, 0],
      [1, 0],
      [1, 1],
    ];
    // Expected rotated L-Tetromino (clockwise):
    // [
    //   [1, 1, 1],
    //   [1, 0, 0],
    // ]
    const expected = [
      [1, 1, 1],
      [1, 0, 0],
    ];
    const result = transformPiece(lPiece, 90, false);
    expect(result).toEqual(expected);
  });

  it('should correctly flip L-Tetromino horizontally', () => {
    const lPiece = [
      [1, 0],
      [1, 0],
      [1, 1],
    ];
    // Expected flipped L-Tetromino:
    // [
    //   [0, 1],
    //   [0, 1],
    //   [1, 1],
    // ]
    const expected = [
      [0, 1],
      [0, 1],
      [1, 1],
    ];
    const result = transformPiece(lPiece, 0, true);
    expect(result).toEqual(expected);
  });

  it('should correctly rotate and flip L-Tetromino', () => {
    const lPiece = [
      [1, 0],
      [1, 0],
      [1, 1],
    ];
    // First flip horizontally:
    //   => [[0,1], [0,1], [1,1]]
    // Then rotate 90° clockwise.
    // Expected result:
    // [
    //   [1, 0, 0],
    //   [1, 1, 1],
    // ]
    const expected = [
      [1, 0, 0],
      [1, 1, 1],
    ];
    const result = transformPiece(lPiece, 90, true);
    expect(result).toEqual(expected);
  });
});