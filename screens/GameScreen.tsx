import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions, LayoutAnimation, UIManager, Platform } from 'react-native';
import { SafeAreaView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';





import { toast } from 'sonner-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BLOKUS_PIECES } from '../components/GamePieces';
import { GamePiece, transformPiece } from '../components/GamePieces';
import GameBoard, { BOARD_SIZE } from '../components/GameBoard';
import PieceSelector from '../components/PieceSelector';
import PlayerInfo from '../components/PlayerInfo';
import AIAssistant from '../components/AIAssistant';
import ControlSidebar from '../components/ControlSidebar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GameScreen() {
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  const route = useRoute();
  const navigation = useNavigation();  // @ts-ignore
  const { mode, selectedColors = [] } = route.params || { mode: 'singleplayer', selectedColors: [] };

const COLOR_MAP = {
  blue: '#3498db',
  red: '#e74c3c',
  green: '#2ecc71',
  yellow: '#f1c40f'
};

let humanColor = COLOR_MAP.blue;
let aiColor = COLOR_MAP.red;
if (selectedColors.length > 0) {
  const selected = selectedColors[0].toLowerCase();
  humanColor = COLOR_MAP[selected] || humanColor;
  // Choose an AI color from available ones not equal to the selected human color
  const available = Object.keys(COLOR_MAP).filter(id => id !== selected);
  if (available.length > 0) {
    aiColor = COLOR_MAP[available[0]];
  }
}

const totalPlayers = mode === 'singleplayer' ? 2 : 4;

  const handleResetGame = () => {
    AsyncStorage.removeItem('gameState');
    navigation.navigate('Home');
};

const handlePlayAgain = () => {
    // Clear any candidate move and reinitialize the game board
    setCandidateMove(null);
    initializeGame();
};
  
  const generateEmptyBoard = () => {
    return Array(BOARD_SIZE).fill(null).map((_, row) =>
      Array(BOARD_SIZE).fill(null).map((_, col) => ({ row, col, player: null }))
    );
  };

  const [selectedPiece, setSelectedPiece] = useState<GamePiece | null>(null);
  const [showControlSidebar, setShowControlSidebar] = useState(false);
  const [candidateMove, setCandidateMove] = useState<{ row: number; col: number } | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [gameState, setGameState] = useState({
    board: Array(BOARD_SIZE)
      .fill(null)
      .map((_, row) =>
        Array(BOARD_SIZE)
          .fill(null)
          .map((_, col) => ({ row, col, player: null }))
      ),    players: mode === 'singleplayer' ? [
      { id: 0, color: humanColor, name: 'Player', score: 0, pieces: [], moveHistory: [] },
      { id: 1, color: aiColor, name: 'AI Player', score: 0, pieces: [], moveHistory: [] }
    ] : [
      { id: 0, color: COLOR_MAP.blue, name: 'Player 1', score: 0, pieces: [], moveHistory: [] },
      { id: 1, color: COLOR_MAP.red, name: 'Player 2', score: 0, pieces: [], moveHistory: [] },
      { id: 2, color: COLOR_MAP.green, name: 'Player 3', score: 0, pieces: [], moveHistory: [] },
      { id: 3, color: COLOR_MAP.yellow, name: 'Player 4', score: 0, pieces: [], moveHistory: [] },
    ],
    currentPlayer: 0,
    turnHistory: [],
    gameStarted: false,
    gameOver: false,
    winner: null,
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    confirmationModal: {
      width: '80%',
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    modalMessage: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    modalButton: {
      flex: 1,
      padding: 10,
      marginHorizontal: 5,
      backgroundColor: '#007AFF',
      borderRadius: 5,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: '#e74c3c',
    },    modalButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    gameStats: {
      startTime: null,
      totalMoves: 0,
    },
    gameOverOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
    },
    gameOverModal: {
      width: '80%',
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    gameOverTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#333',
    },
    gameOverSubtitle: {
      fontSize: 18,
      color: '#444',
      marginBottom: 10,
    },
    gameOverScore: {
      fontSize: 16,
      color: '#555',
    },
    gameOverWinner: {
      fontWeight: 'bold',
      color: '#007AFF',
    },
    gameOverButton: {
      backgroundColor: '#007AFF',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginTop: 20,
    },
    gameOverButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
});

  useEffect(() => {
  async function loadGame() {
    try {
      const storedState = await AsyncStorage.getItem('gameState');
      if (storedState) {
        setGameState(JSON.parse(storedState));
      } else {
        initializeGame();
      }
    } catch (error) {
      console.log(`Error loading game state: ${error}`);
      initializeGame();
    }
  }
  loadGame();
}, []);  const initializeGame = () => {
  const newBoard = generateEmptyBoard();
  const updatedPlayers = gameState.players.map((player) => ({
    ...player,
    pieces: generatePlayerPieces(),
    moveHistory: [],
    statistics: {
      movesMade: 0,
      passes: 0,
      totalScore: 0,
    },
    extraInfo: {
      lastMoveTimestamp: null,
      powerUps: [],
    },
  }));

  setGameState((prev) => ({
    ...prev,
    board: newBoard,
    players: updatedPlayers,
    gameStarted: true,
    currentPlayer: 0,
    turnHistory: [],
    gameStats: {
      startTime: Date.now(),
      totalMoves: 0,
    },
    gameOver: false,
    winner: null,
  }));  };  useEffect(() => {
  AsyncStorage.setItem('gameState', JSON.stringify(gameState));
}, [gameState]);



const generatePlayerPieces = () => {
  // Return a fresh copy of the full list of 21 Blokus pieces,
  // marking each as unused.
  return BLOKUS_PIECES.map(piece => ({ ...piece, used: false }));
};  const validatePiecePlacement = (
  piece: GamePiece,
  boardPosition: { row: number; col: number },
  board: { row: number; col: number; player: number | null }[][],
  currentPlayer: number
): boolean => {
  const shape = (piece as GamePiece & { transformedShape?: number[][] }).transformedShape || piece.shape;
  
  // Check if the player has already placed a piece
  const hasPlacedPiece = board.some(row => row.some(cell => cell.player === currentPlayer));
  
  const startingCorners = [
    { row: 0, col: 0 },
    { row: 0, col: BOARD_SIZE - 1 },
    { row: BOARD_SIZE - 1, col: BOARD_SIZE - 1 },
    { row: BOARD_SIZE - 1, col: 0 },
  ];
  const requiredCorner = startingCorners[currentPlayer];
  
  let coversStartingCorner = false;
  let touchesDiagonal = false;
  
  // Check each cell of the piece
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[0].length; j++) {
      if (shape[i][j] === 1) {
        const boardRow = boardPosition.row + i;
        const boardCol = boardPosition.col + j;
        
        // Check if piece is within board boundaries
        if (boardRow < 0 || boardRow >= BOARD_SIZE || boardCol < 0 || boardCol >= BOARD_SIZE) {
          return false;
        }
        
        // Check if cell is already occupied
        if (board[boardRow][boardCol].player !== null) {
          return false;
        }
        
        // Check if piece covers the starting corner (for first move)
        if (!hasPlacedPiece && boardRow === requiredCorner.row && boardCol === requiredCorner.col) {
          coversStartingCorner = true;
        }
        
        // Check if piece touches any existing piece of the same player on edges
        const edges = [
          { row: boardRow - 1, col: boardCol },
          { row: boardRow + 1, col: boardCol },
          { row: boardRow, col: boardCol - 1 },
          { row: boardRow, col: boardCol + 1 },
        ];
        
        for (const edge of edges) {
          if (edge.row >= 0 && edge.row < BOARD_SIZE && edge.col >= 0 && edge.col < BOARD_SIZE) {
            if (board[edge.row][edge.col].player === currentPlayer) {
              return false; // Cannot share an edge with own piece
            }
          }
        }
        
        // Check if piece touches any existing piece of the same player diagonally
        const diagonals = [
          { row: boardRow - 1, col: boardCol - 1 },
          { row: boardRow - 1, col: boardCol + 1 },
          { row: boardRow + 1, col: boardCol - 1 },
          { row: boardRow + 1, col: boardCol + 1 },
        ];
        
        for (const diag of diagonals) {
          if (diag.row >= 0 && diag.row < BOARD_SIZE && diag.col >= 0 && diag.col < BOARD_SIZE) {
            if (board[diag.row][diag.col].player === currentPlayer) {
              touchesDiagonal = true;
            }
          }
        }
      }
    }
  }
  
  // For first move: piece must cover the starting corner
  if (!hasPlacedPiece) {
    return coversStartingCorner;
  } 
  // For subsequent moves: piece must touch another piece diagonally
  else {
    return touchesDiagonal;
  }
};  const requestPiecePlacement = (boardPosition: { row: number; col: number }) => {
  if (!selectedPiece) {
    console.log(`No piece selected to place.`);
    return;
  }
  setCandidateMove(boardPosition);  };  const handlePiecePlacement = (initialBoardPosition: { row: number; col: number }, pieceOverride?: GamePiece & { rotation: number, flipped: boolean, transformedShape: number[][] }) => {
    const pieceToPlace = pieceOverride ? pieceOverride : selectedPiece;
    if (!pieceToPlace) {
      console.log('No piece selected.');
      return;
    }
    let boardPosition = initialBoardPosition;
    // For the first move, if placement is invalid due to not covering the starting corner, attempt auto-adjust.
    const currentPlayer = gameState.currentPlayer;
    const hasPlacedPiece = gameState.board.some(row => row.some(cell => cell.player === currentPlayer));
    if (!hasPlacedPiece && !validatePiecePlacement(pieceToPlace, boardPosition, gameState.board, currentPlayer)) {
      const startingCorners = [
        { row: 0, col: 0 },
        { row: 0, col: BOARD_SIZE - 1 },
        { row: BOARD_SIZE - 1, col: BOARD_SIZE - 1 },
        { row: BOARD_SIZE - 1, col: 0 },
      ];
      const requiredCorner = startingCorners[currentPlayer];
      const shape = (pieceToPlace as GamePiece & { transformedShape?: number[][] }).transformedShape || pieceToPlace.shape;
      let adjusted = false;
      for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[0].length; j++) {
          if (shape[i][j] === 1) {
            const adjustedOrigin = { row: requiredCorner.row - i, col: requiredCorner.col - j  };            if (validatePiecePlacement(pieceToPlace, adjustedOrigin, gameState.board, currentPlayer)) {
              console.log(`Auto-adjusting placement from (${boardPosition.row}, ${boardPosition.col}) to (${adjustedOrigin.row}, ${adjustedOrigin.col}) to cover starting corner.`);
              boardPosition = adjustedOrigin;
              adjusted = true;
              break;
            }
          }
        }
        if (adjusted) break;
      }
      if (!adjusted) {
        console.log(`Invalid move: First piece for player ${currentPlayer + 1} must cover the starting corner at ${JSON.stringify(requiredCorner)}.`);
        toast.error(`Invalid move: First piece for player ${currentPlayer + 1} must cover the starting corner at ${JSON.stringify(requiredCorner)}.`);
        return;
      }
    } else if (!validatePiecePlacement(pieceToPlace, boardPosition, gameState.board, currentPlayer)) {
      console.log(`Invalid placement attempted for player ${currentPlayer + 1}.`);
      toast.error(`Invalid placement attempted for player ${currentPlayer + 1}.`);
      return;
    }
    console.log(
      `Placing piece: ${pieceToPlace.name} at position: (${boardPosition.row}, ${boardPosition.col})`
    );

    const updatedPlayers = [...gameState.players];    const playerPieces = [...updatedPlayers[gameState.currentPlayer].pieces];      const pieceIndex = playerPieces.findIndex((p) => p.id === pieceToPlace.id);

    if (pieceIndex !== -1) {
      playerPieces[pieceIndex] = { ...playerPieces[pieceIndex], used: true  };      const currentPlayerIndex = gameState.currentPlayer;
      const moveRecord = {
        type: 'move',
        piece: pieceToPlace.name,
        position: boardPosition,
        scoreGained: calculatePieceScore(pieceToPlace),
        timestamp: Date.now()  };      const currentPlayerState = updatedPlayers[currentPlayerIndex];
      currentPlayerState.moveHistory = [...currentPlayerState.moveHistory, moveRecord];
      updatedPlayers[currentPlayerIndex] = {
        ...currentPlayerState,
        pieces: playerPieces,
        score: currentPlayerState.score + calculatePieceScore(pieceToPlace),  };      const shape = (pieceToPlace as GamePiece & { transformedShape?: number[][] }).transformedShape || pieceToPlace.shape;
      const newBoard = gameState.board.map((row) => row.map((cell) => ({ ...cell })));      for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[0].length; j++) {
          if (shape[i][j] === 1) {
            const targetRow = boardPosition.row + i;
            const targetCol = boardPosition.col + j;
            if (
              targetRow >= 0 &&
              targetRow < gameState.board.length &&
              targetCol >= 0 &&
              targetCol < gameState.board[0].length
            ) {
              newBoard[targetRow][targetCol] = {
                ...newBoard[targetRow][targetCol],
                player: currentPlayerIndex,
                pieceId: pieceToPlace.id,  };              } else {
              console.log(`Skipping cell update at out-of-bound index (${targetRow}, ${targetCol}).`);
            }
          }
        }
      }      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);      const newCurrentPlayer = (gameState.currentPlayer + 1) % totalPlayers;      setGameState((prev) => ({
        ...prev,
        board: newBoard,
        players: updatedPlayers,
        currentPlayer: newCurrentPlayer,
        turnHistory: [
          ...prev.turnHistory,
          { type: 'move', player: currentPlayerIndex, piece: pieceToPlace.name, position: boardPosition, timestamp: Date.now() }
        ],
        gameStats: { ...prev.gameStats, totalMoves: prev.gameStats.totalMoves + 1 },
      }));

      setSelectedPiece(null);
    }  };    const calculatePieceScore = (piece: any) => {
    return piece.shape.reduce(
      (count: number, row: number[]) => count + row.reduce((rowCount, cell) => rowCount + (cell ? 1 : 0), 0),
      0
    );  };  const handlePassTurn = () => {
    console.log(`Player ${gameState.currentPlayer + 1} passes turn`);
    setGameState((prev) => {
      const currentPlayerIndex = prev.currentPlayer;
      const updatedPlayers = [...prev.players];
      const currentPlayerState = updatedPlayers[currentPlayerIndex];
      const passRecord = { type: 'pass', timestamp: Date.now()  };      currentPlayerState.moveHistory = [...currentPlayerState.moveHistory, passRecord];      const currentStats = currentPlayerState.statistics || { movesMade: 0, passes: 0, totalScore: 0 };
      currentPlayerState.statistics = {
         ...currentStats,
         passes: (currentStats.passes || 0) + 1,
      };      updatedPlayers[currentPlayerIndex] = { ...currentPlayerState  };      return {
        ...prev,        currentPlayer: (prev.currentPlayer + 1) % totalPlayers,
        turnHistory: [...prev.turnHistory, { type: 'pass', player: currentPlayerIndex, timestamp: Date.now() }],
        players: updatedPlayers,
        gameStats: { ...prev.gameStats, totalMoves: prev.gameStats.totalMoves + 1 },  };              });  };  const handleUndo = () => {
    if (gameState.turnHistory.length === 0) {
      toast.error(`No moves to undo.`);
      return;
    }
    // Get the last move record
    const lastMove = gameState.turnHistory[gameState.turnHistory.length - 1];
    let newBoard = gameState.board.map(row => row.map(cell => ({ ...cell })));
    let updatedPlayers = [...gameState.players];
    let newTurnHistory = gameState.turnHistory.slice(0, -1);

    if (lastMove.type === 'move') {
      const playerIndex = lastMove.player;
      // Remove the move record from the player's moveHistory
      updatedPlayers[playerIndex].moveHistory = updatedPlayers[playerIndex].moveHistory.filter(move => move.timestamp !== lastMove.timestamp);
      // Revert board cells where that piece was placed.
      newBoard = newBoard.map(row => row.map(cell => {
        if (cell.player === playerIndex && cell.pieceId && cell.pieceId.toString() === lastMove.piece.toString()) {
          return { ...cell, player: null, pieceId: undefined  };              }
        return cell;
      }));
      // Mark the piece as unused again
      updatedPlayers[playerIndex].pieces = updatedPlayers[playerIndex].pieces.map(p => {
        if (p.name === lastMove.piece) {
          return { ...p, used: false  };              }
        return p;
      });
      // Set currentPlayer back to the one who made the move
      setGameState((prev) => ({
        ...prev,
        board: newBoard,
        players: updatedPlayers,
        currentPlayer: lastMove.player,
        turnHistory: newTurnHistory,
        gameStats: { ...prev.gameStats, totalMoves: prev.gameStats.totalMoves - 1 },
      }));
    } else if (lastMove.type === 'pass') {
      // Simply revert pass turn
      const playerIndex = lastMove.player;
      updatedPlayers[playerIndex].moveHistory = updatedPlayers[playerIndex].moveHistory.filter(move => move.timestamp !== lastMove.timestamp);
      setGameState((prev) => ({
        ...prev,
        currentPlayer: playerIndex,
        turnHistory: newTurnHistory,
        players: updatedPlayers,
        gameStats: { ...prev.gameStats, totalMoves: prev.gameStats.totalMoves - 1 },
      }));
    }  };  const handleAIAssistance = () => {    setShowAIAssistant(!showAIAssistant);  };  const hasValidMoves = (playerIdx: number): boolean => {
    const playerPieces = gameState.players[playerIdx].pieces.filter(p => !p.used);
    const rotations = [0, 90, 180, 270];
    const flips = [false, true];
    for (const p of playerPieces) {
      for (const r of rotations) {
        for (const f of flips) {
          const transformedShape = transformPiece(p.shape, r, f);
          const candidatePiece = { ...p, rotation: r, flipped: f, transformedShape  };            for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
              if (validatePiecePlacement(candidatePiece, { row, col }, gameState.board, playerIdx)) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;  };  useEffect(() => {
    /* New AI Move Calculation Function */
const computeAIMove = () => {
  const currentPlayer = gameState.currentPlayer;
  let bestMove = null;
  let bestScore = -Infinity;
  const rotations = [0, 90, 180, 270];
  const flips = [false, true];
  const aiPieces = gameState.players[currentPlayer].pieces.filter(p => !p.used);
  for (const piece of aiPieces) {
    for (const r of rotations) {
      for (const f of flips) {
        const transformedShape = transformPiece(piece.shape, r, f);
        const candidatePiece = { ...piece, rotation: r, flipped: f, transformedShape };
        for (let row = 0; row < BOARD_SIZE; row++) {
          for (let col = 0; col < BOARD_SIZE; col++) {
            if (validatePiecePlacement(candidatePiece, { row, col }, gameState.board, currentPlayer)) {
              const currentScore = calculatePieceScore(candidatePiece);
              if (currentScore > bestScore) {
                bestScore = currentScore;
                bestMove = { boardPosition: { row, col }, piece: candidatePiece };
              }
            }
          }
        }
      }
    }
  }
  return bestMove;
};

if (mode === 'singleplayer' && gameState.currentPlayer === 1 && !gameState.gameOver) {


      const timer = setTimeout(() => {
        const move = computeAIMove();
        if (move) {
          handlePiecePlacement(move.boardPosition, move.piece);
        } else {
          console.log("AI has no valid moves. Passing turn.");
          setGameState((prev) => ({
            ...prev,        currentPlayer: (prev.currentPlayer + 1) % totalPlayers,
            turnHistory: [...prev.turnHistory, { type: 'pass', player: prev.currentPlayer }],
          }));
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, mode, gameState]);
  
  useEffect(() => {
    if (!gameState.gameOver) {
      const allBlocked = gameState.players.every((_, idx) => !hasValidMoves(idx));
      if (allBlocked) {
        const winner = gameState.players.reduce((prev, p) => (p.score > prev.score ? p : prev));
        setGameState((prev) => ({ ...prev, gameOver: true, winner: winner.id }));
        console.log(`Game over! Winner: ${winner.name}`);
      }
    }
  }, [gameState.board, gameState.players]);
  
  return (
    <SafeAreaView style={styles.container}>      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
          hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'singleplayer'
            ? 'Game vs AI'
            : mode === 'multiplayer'
            ? 'Multiplayer Game'
            : 'Tutorial'}
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{ padding: 8, marginRight: 5 }}
            onPress={() => setShowControlSidebar(true)}
            hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
          >
            <Ionicons name="menu" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.aiButton}
            onPress={handleAIAssistance}
            hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
          >
            <Ionicons name="bulb" size={24} color={showAIAssistant ? "#ffc107" : "#333"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.gameContainer}>          <PlayerInfo players={gameState.players} currentPlayer={gameState.currentPlayer} />          <GameBoard
            board={gameState.board}
            players={gameState.players}
            selectedPiece={selectedPiece}
            currentPlayer={gameState.currentPlayer}
            onPiecePlacement={requestPiecePlacement}
            canPlacePieceAt={(row, col) => {
              if (!selectedPiece) return false;
              return validatePiecePlacement(
                selectedPiece,
                { row, col },
                gameState.board,
                gameState.currentPlayer
              );
            }}
          />
          <PieceSelector
            pieces={gameState.players[gameState.currentPlayer].pieces.filter((p) => !p.used)}
            playerColor={gameState.players[gameState.currentPlayer].color}
            onSelectPiece={(piece) => setSelectedPiece(piece)}
          />
        </View>      {(mode !== 'singleplayer' || gameState.currentPlayer !== 1) && (
        <TouchableOpacity style={styles.passButton} onPress={handlePassTurn}>
          <Text style={styles.passButtonText}>Pass Turn</Text>
        </TouchableOpacity>
      )}      </ScrollView>      {/* Removed bottom control buttons. Using sidebar instead. */}      {showAIAssistant && (
        <AIAssistant
          gameState={gameState}
          currentPlayer={gameState.currentPlayer}
          onClose={() => setShowAIAssistant(false)}
        />
      )}      <ControlSidebar
        onUndo={handleUndo}
        onPassTurn={handlePassTurn}
        onResetGame={handleResetGame}
        closeSidebar={() => setShowControlSidebar(false)}
      />
      {/* Removed Game Over overlay */}
{gameState.gameOver && (
  <Modal transparent={true} animationType="fade" visible={true}>
    <View style={styles.gameOverOverlay}>
      <View style={styles.gameOverModal}>
        <Text style={styles.gameOverTitle}>Game Over!</Text>
        <Text style={styles.gameOverSubtitle}>Final Scores:</Text>
        {gameState.players.map(player => (
          <Text key={player.id} style={[styles.gameOverScore, player.id === gameState.winner && styles.gameOverWinner]}>
            {player.name}: {player.score}
          </Text>
        ))}
        <TouchableOpacity style={styles.gameOverButton} onPress={handlePlayAgain}>
          <Text style={styles.gameOverButtonText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)}
    {candidateMove && selectedPiece && (
  <Modal transparent={true} animationType="fade" visible={true}>
    <View style={styles.modalOverlay}>
      <View style={styles.confirmationModal}>
        <Text style={styles.modalTitle}>Confirm Placement</Text>
        <Text style={styles.modalMessage}>
          Place {selectedPiece.name} at ({candidateMove.row}, {candidateMove.col})?
        </Text>
        <View style={styles.modalButtons}>          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              console.log(`Confirm pressed with candidateMove: ${JSON.stringify(candidateMove)} and selectedPiece: ${JSON.stringify(selectedPiece)}`);
              if (candidateMove && selectedPiece) {
                handlePiecePlacement(candidateMove, selectedPiece);
              } else {
                console.error("Cannot confirm placement because candidateMove or selectedPiece is null.");
              }
              setCandidateMove(null);
            }}
          >
            <Text style={styles.modalButtonText}>Confirm</Text>
          </TouchableOpacity>          

          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setCandidateMove(null)}
          >
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
)}
</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  aiButton: {
    padding: 8,
  },  scrollContent: {
    flexGrow: 1,
    paddingVertical: 5,
  },
  gameContainer: {
    padding: 0, // Removed padding to maximize space
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationModal: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },    modalButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    gameStats: {
      startTime: null,
      totalMoves: 0,
    },
    gameOverOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
    },
    gameOverModal: {
      width: '80%',
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    gameOverTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#333',
    },
    gameOverSubtitle: {
      fontSize: 18,
      color: '#444',
      marginBottom: 10,
    },
    gameOverScore: {
      fontSize: 16,
      color: '#555',
    },
    gameOverWinner: {
      fontWeight: 'bold',
      color: '#007AFF',
    },
    gameOverButton: {
      backgroundColor: '#007AFF',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginTop: 20,
    },
    gameOverButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
});