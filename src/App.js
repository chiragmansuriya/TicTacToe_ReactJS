import { useEffect, useState } from 'react';
import './App.css';

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function calculateWinner(squares) {
  for (const [a, b, c] of winningLines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function isBoardFull(squares) {
  return squares.every((square) => square !== null);
}

function minimax(board, player) {
  const winner = calculateWinner(board);
  if (winner === 'O') return { score: 1 };
  if (winner === 'X') return { score: -1 };
  if (isBoardFull(board)) return { score: 0 };

  const moves = [];
  board.forEach((square, index) => {
    if (square === null) {
      const nextBoard = board.slice();
      nextBoard[index] = player;
      const result = minimax(nextBoard, player === 'O' ? 'X' : 'O');
      moves.push({ index, score: result.score });
    }
  });

  if (player === 'O') {
    return moves.reduce((best, move) => (move.score > best.score ? move : best), { score: -Infinity });
  }

  return moves.reduce((best, move) => (move.score < best.score ? move : best), { score: Infinity });
}

function getComputerMove(board) {
  const bestMove = minimax(board, 'O');
  return bestMove.index;
}

function App() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [status, setStatus] = useState('Your turn — X');
  const [isThinking, setIsThinking] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const resetGame = () => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setSquares(Array(9).fill(null));
    setStatus('Your turn — X');
    setIsThinking(false);
    setGameOver(false);
  };

  const handleSquareClick = (index) => {
    if (gameOver || isThinking || squares[index]) return;

    const nextSquares = squares.slice();
    nextSquares[index] = 'X';
    const winner = calculateWinner(nextSquares);

    if (winner) {
      setSquares(nextSquares);
      setStatus('You win!');
      setGameOver(true);
      return;
    }

    if (isBoardFull(nextSquares)) {
      setSquares(nextSquares);
      setStatus('Draw!');
      setGameOver(true);
      return;
    }

    setSquares(nextSquares);
    setStatus('Computer is thinking...');
    setIsThinking(true);

    const id = window.setTimeout(() => {
      const computerIndex = getComputerMove(nextSquares);
      if (computerIndex === undefined || computerIndex === null) {
        setStatus('Draw!');
        setGameOver(true);
        setIsThinking(false);
        setTimeoutId(null);
        return;
      }

      const boardAfterComputer = nextSquares.slice();
      boardAfterComputer[computerIndex] = 'O';
      const nextWinner = calculateWinner(boardAfterComputer);

      setSquares(boardAfterComputer);
      setIsThinking(false);
      setTimeoutId(null);

      if (nextWinner) {
        setStatus('Computer wins!');
        setGameOver(true);
      } else if (isBoardFull(boardAfterComputer)) {
        setStatus('Draw!');
        setGameOver(true);
      } else {
        setStatus('Your turn — X');
      }
    }, 300);

    setTimeoutId(id);
  };

  return (
    <div className="app">
      <div className="game-shell">
        <h1>Tic Tac Toe</h1>
        <p className="status">{status}</p>

        <div className="board">
          {squares.map((value, index) => (
            <button
              key={index}
              className="square"
              onClick={() => handleSquareClick(index)}
              disabled={Boolean(value) || gameOver || isThinking}
            >
              {value}
            </button>
          ))}
        </div>

        <button className="reset-button" onClick={resetGame}>
          Reset Game
        </button>

        <div className="legend">
          <div>
            <span className="legend-chip human">X</span> You
          </div>
          <div>
            <span className="legend-chip computer">O</span> Computer
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
