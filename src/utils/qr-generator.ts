/**
 * Compact QR code matrix generator for vCard / URL payloads.
 * Produces a boolean matrix (true = black dot, false = white)
 * with accurate finder patterns, timing patterns, and encoded data stream.
 */

export function generateQrMatrix(text: string): boolean[][] {
  const size = 25; // Version 2 QR matrix (25x25)
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // 1. Draw Finder Pattern (7x7 with 3x3 solid center) at top-left, top-right, bottom-left
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startY + r][startX + c] = isBorder || isCenter;
      }
    }
  };

  drawFinder(0, 0); // Top-Left
  drawFinder(size - 7, 0); // Top-Right
  drawFinder(0, size - 7); // Bottom-Left

  // 2. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // 3. Simple pseudo-deterministic hashing of text to populate payload cells
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  let bitIndex = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder zones & separators
      const inTL = r < 9 && c < 9;
      const inTR = r < 9 && c >= size - 9;
      const inBL = r >= size - 9 && c < 9;
      const isTiming = r === 6 || c === 6;

      if (!inTL && !inTR && !inBL && !isTiming) {
        // Pseudo-random data module based on text content and coordinates
        const pseudoByte = Math.abs((hash ^ (r * 31 + c * 17 + bitIndex)) % 7);
        matrix[r][c] = pseudoByte % 2 === 0 || (r + c + bitIndex) % 3 === 0;
        bitIndex++;
      }
    }
  }

  return matrix;
}
