import { PieceColor, PieceType } from "./constants";
import { getMoves } from "./moves";
import { findBoardIndices } from "./board";
import {
  getCellValue,
  getXYFromSAN,
  getXYFromIndex,
  getIndexFromSAN,
  getPieceTypeFromSAN,
} from "./utils";

function distinguishIndex(index, dis) {
  if (dis === undefined) {
    return true;
  }

  const p1 = getXYFromIndex(index);
  const p2 = getXYFromSAN(dis);

  return (p2.x === -1 || p2.x === p1.x) && (p2.y === -1 || p2.y === p1.y);
}

export function validateMove(game, move) {
  const destIndex = getIndexFromSAN(move.dest);

  // Find matching pieces
  const piece = getCellValue(
    getPieceTypeFromSAN(move.piece) || PieceType.pawn,
    game.turn
  );

  const indices = findBoardIndices(
    game.board,
    (cell) => cell === piece
  ).filter((index) => distinguishIndex(index, move.dis));

  // Determine which indices that can move to the destination
  const matchingIndices = indices.map((index) =>
    getMoves(game.board, index).includes(destIndex)
  );

  const matchingCount = matchingIndices.reduce((a, b) => {
    return b ? a + 1 : a;
  }, 0);

  if (matchingCount === 0) {
    return { error: "Move not available" };
  }

  if (matchingCount > 1) {
    return { error: "Ambiguous move" };
  }

  return {
    fromIndex: indices[matchingIndices.indexOf(true)],
    toIndex: destIndex,
  };
}

export function nextTurn(game) {
  return {
    ...game,
    turn: game.turn === PieceColor.white ? PieceColor.black : PieceColor.white,
  };
}

export function makeMove(game, fromIndex, toIndex) {
  // Make move on board
  const board = game.board.slice();
  board[toIndex] = board[fromIndex];
  board[fromIndex] = 0;

  // Change turn
  const turn =
    game.turn === PieceColor.white ? PieceColor.black : PieceColor.white;

  return { ...game, board, turn };
}
