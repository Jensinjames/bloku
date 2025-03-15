import { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  Platform, 
  useWindowDimensions,
  PanResponder,
  Animated,
  ScrollView,
  GestureResponderEvent
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

type BoardCell = {
  row: number;
  col: number;
  player: number | null;
  pieceId?: number;
};

export const BOARD_SIZE = 20;
/* Removed fixed PLAYER_COLORS.
   The players prop will be used for color rendering.
*/
const STARTING_CORNERS = [
  { row: 0, col: 0 },                        // Player 0: top-left
  { row: 0, col: BOARD_SIZE - 1 },           // Player 1: top-right
  { row: BOARD_SIZE - 1, col: BOARD_SIZE - 1 }, // Player 2: bottom-right
  { row: BOARD_SIZE - 1, col: 0 },           // Player 3: bottom-left
];

const MIN_SCALE = 0.75;
const MAX_SCALE = 2.5;

interface GameBoardProps {
  board: BoardCell[][];
  currentPlayer: number;
  players: { color: string }[];
  selectedPiece: {
    transformedShape: number[][];
  } | null;
  onPiecePlacement: (row: number, col: number) => void;
  canPlacePieceAt?: (row: number, col: number) => boolean;
}

export default function GameBoard({ board, currentPlayer, players, selectedPiece, onPiecePlacement, canPlacePieceAt }: GameBoardProps) {
  const { width, height } = useWindowDimensions();
  const [hoverPosition, setHoverPosition] = useState<{row: number, col: number} | null>(null);
  const [touchFeedback, setTouchFeedback] = useState<{row: number, col: number} | null>(null);
  const [legalMoves, setLegalMoves] = useState<{row: number, col: number}[]>([]);  const [isShowingLegalMoves, setIsShowingLegalMoves] = useState(false);
  const [fitToScreen, setFitToScreen] = useState(true);
  
  // State for zoom and pan
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);
  const lastPinchDistance = useRef(0);
  const isZooming = useRef(false);  // Calculate cell size dynamically based on available screen space
  const BASE_CELL_SIZE = Math.floor(Math.min(
    width * 0.95, // Use more horizontal space
    height * 0.75  // Use more vertical space
  ) / BOARD_SIZE);
  
  // Calculate legal moves when a piece is selected
  useEffect(() => {
    if (selectedPiece && typeof canPlacePieceAt === 'function') {
      findLegalMoves();
    } else {
      setLegalMoves([]);
      setIsShowingLegalMoves(false);
    }
  }, [selectedPiece, currentPlayer]);
  
  // Find all legal moves for the current piece
  const findLegalMoves = () => {
    if (!selectedPiece || typeof canPlacePieceAt !== 'function') return;
    
    const legal: {row: number, col: number}[] = [];
    
    // Check each possible position on the board
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (canPlacePieceAt(row, col)) {
          legal.push({ row, col });
        }
      }
    }
    
    setLegalMoves(legal);
  };
  
  // Show legal moves button press handler
  const toggleLegalMoves = () => {
    setIsShowingLegalMoves(prev => !prev);
  };
  
  // Distance between two points for pinch calculation
  const distance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };
  
  // Pan responder for touch gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        pan.setValue({ x: 0, y: 0 });
        lastPinchDistance.current = 0;
      },
      
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        
        // Handle pinch to zoom with two fingers
        if (touches.length === 2) {
          isZooming.current = true;
          
          const touch1 = touches[0];
          const touch2 = touches[1];
          
          const currentDistance = distance(
            touch1.pageX, touch1.pageY,
            touch2.pageX, touch2.pageY
          );
          
          if (lastPinchDistance.current === 0) {
            lastPinchDistance.current = currentDistance;
            return;
          }
          
          const newScale = lastScale.current * (currentDistance / lastPinchDistance.current);
          
          // Limit scale to prevent too small or too large
          if (newScale >= MIN_SCALE && newScale <= MAX_SCALE) {
            scale.setValue(newScale);
          }
          
          lastPinchDistance.current = currentDistance;
        } 
        // Handle panning with one finger when zoomed in
        else if (touches.length === 1 && scale._value > 1) {
          // Only allow panning when zoomed in
          Animated.event(
            [null, { dx: pan.x, dy: pan.y }],
            { useNativeDriver: false }
          )(evt, gestureState);
        }
      },
      
      onPanResponderRelease: () => {
        pan.flattenOffset();
        lastScale.current = scale._value;
        
        // If was zooming, prevent triggering cell tap
        setTimeout(() => {
          isZooming.current = false;
        }, 100);
      }
    })
  ).current;

  // Reset zoom and pan to default
  const resetZoom = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,        useNativeDriver: false,
        friction: 5
      }),
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },        useNativeDriver: false,
        friction: 5
      })
    ]).start();
    
    lastScale.current = 1;
  };
  
  // Show touch feedback briefly
  useEffect(() => {
    if (touchFeedback) {
      const timer = setTimeout(() => {
        setTouchFeedback(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [touchFeedback]);
  
  // Check if a cell is at one of the starting corners
  const isStartingCorner = (row: number, col: number, player: number) => {
    const corner = STARTING_CORNERS[player];
    return row === corner.row && col === corner.col;
  };
  
  // Check if a cell would be part of a legal move when highlighted
  const isLegalMovePosition = (row: number, col: number) => {
    if (!isShowingLegalMoves || legalMoves.length === 0) return false;
    
    return legalMoves.some(position => {
      // Check if this position is the top-left corner of a legal move
      if (position.row === row && position.col === col) return true;
      
      return false;
    });
  };

  const renderPiecePreview = (row: number, col: number) => {
  if (!selectedPiece || !hoverPosition) return null;
  
  const { transformedShape } = selectedPiece;
  const startRow = hoverPosition.row;
  const startCol = hoverPosition.col;
  
  // Only render cell if it's part of the hovered piece preview
  const offsetRow = row - startRow;
  const offsetCol = col - startCol;
  
  if (offsetRow >= 0 && offsetRow < transformedShape.length &&
      offsetCol >= 0 && offsetCol < transformedShape[0].length) {
    if (transformedShape[offsetRow][offsetCol] === 1) {
      // Use the player's color from the players prop.
      const isValid = canPlacePieceAt ? canPlacePieceAt(startRow, startCol) : true;
      return {
        backgroundColor: players[currentPlayer].color + (isValid ? '80' : '40'),
        opacity: isValid ? 0.8 : 0.4,
      };
    }
  }
  return null;
};
  
  const handleCellPress = (position: {row: number, col: number}) => {
    // Don't trigger cell press if we're in the middle of zooming/panning
    if (isZooming.current) return;
    
    setTouchFeedback(position);
    onPiecePlacement(position);
  };

  const renderCell = (row: number, col: number) => {
    const cellState = board[row]?.[col]?.player;
    const isCorner = isStartingCorner(row, col, 0) || 
                     isStartingCorner(row, col, 1) ||
                     isStartingCorner(row, col, 2) ||
                     isStartingCorner(row, col, 3);
    
    const isCurrentPlayerCorner = isStartingCorner(row, col, currentPlayer);
    const isLegalMove = isLegalMovePosition(row, col);  const previewStyle = hoverPosition ? renderPiecePreview(row, col) : null;
  const isTouchFeedback = touchFeedback && touchFeedback.row === row && touchFeedback.col === col;
  
  return (    <TouchableOpacity
      key={`${row}-${col}`}
      style={[
        styles.cell,
        {
          width: BASE_CELL_SIZE,
          height: BASE_CELL_SIZE,
          borderRightWidth: col === BOARD_SIZE - 1 ? 1 : 0,
          borderBottomWidth: row === BOARD_SIZE - 1 ? 1 : 0,
        },
        cellState !== null && { backgroundColor: players[cellState].color },
        previewStyle,
        isTouchFeedback && styles.touchFeedback,
        isLegalMove && styles.legalMoveCell
      ]}
      onPress={() => handleCellPress({ row, col })}
      onLongPress={() => setHoverPosition({ row, col })}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      {...(Platform.OS === 'web'
        ? {
            onMouseEnter: () => setHoverPosition({ row, col }),
            onMouseLeave: () => setHoverPosition(null),
          }
        : {})}
    >
        {isCorner && (
          <View style={[
            styles.cornerMarker,
            isCurrentPlayerCorner && styles.currentPlayerCorner
          ]}>
            {isCurrentPlayerCorner && <Ionicons name="star" size={12} color="#fff" />}
          </View>
        )}
        
        {isLegalMove && (
          <View style={styles.legalMoveIndicator}>
            <Ionicons name="checkmark-circle" size={10} color="#4CAF50" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderGrid = () => {
    const grid = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      const rowCells = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        rowCells.push(renderCell(row, col));
      }
      grid.push(
        <View key={row} style={styles.row}>
          {rowCells}
        </View>
      );
    }
    return grid;
  };

  // Interpolate scale for zoom effect
  const boardScale = scale.interpolate({
    inputRange: [MIN_SCALE, MAX_SCALE],
    outputRange: [MIN_SCALE, MAX_SCALE],
    extrapolate: 'clamp'
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.boardWrapper}>  <View style={styles.zoomControlsContainer}>
          <TouchableOpacity style={styles.zoomButton} onPress={resetZoom}>
            <MaterialIcons name="zoom-out-map" size={18} color="#666" />
            <Text style={styles.zoomButtonText}>Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.zoomButton, fitToScreen && styles.activeButton]}
            onPress={() => setFitToScreen(!fitToScreen)}
          >
            <MaterialIcons 
              name={fitToScreen ? "fit-screen" : "fullscreen"} 
              size={18} 
              color={fitToScreen ? "#3498db" : "#666"}
            />
            <Text style={[
              styles.zoomButtonText,
              fitToScreen && styles.activeButtonText
            ]}>
              {fitToScreen ? "Fitted" : "Free"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.zoomButton, isShowingLegalMoves && styles.activeButton]} 
            onPress={toggleLegalMoves}
            disabled={!selectedPiece || legalMoves.length === 0}
          >
            <MaterialIcons 
              name={isShowingLegalMoves ? "visibility" : "visibility-off"} 
              size={18} 
              color={selectedPiece && legalMoves.length > 0 ? (isShowingLegalMoves ? "#3498db" : "#666") : "#aaa"} 
            />
            <Text style={[
              styles.zoomButtonText,
              (!selectedPiece || legalMoves.length === 0) && styles.disabledText,
              isShowingLegalMoves && styles.activeButtonText
            ]}>
              {isShowingLegalMoves ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.boardContainer} {...panResponder.panHandlers}>
          <Animated.View 
            style={[
              styles.board,
              {
                transform: [
                  { translateX: pan.x },
                  { translateY: pan.y },
                  { scale: boardScale }
                ]
              }
            ]}
          >
            {renderGrid()}
          </Animated.View>
        </View>
        
        {isShowingLegalMoves && legalMoves.length > 0 && (
          <View style={styles.legalMovesInfo}>
            <Text style={styles.legalMovesText}>
              <Text style={styles.legalMovesCount}>{legalMoves.length}</Text> possible placements
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          {!selectedPiece ? (
            'Select a piece from your inventory'
          ) : (
            'Tap on the board to place your piece'
          )}
        </Text>        <Text style={styles.mobileHint}>
          {Platform.OS !== 'web' ? (
            'Pinch to zoom • Toggle "Fitted" for best view • Long press to preview'
          ) : (
            'Use mouse wheel to zoom • Toggle "Fitted" for best view'
          )}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({  container: {
    alignItems: 'center',
    marginVertical: 5,
  },
  boardWrapper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    width: '98%',
    maxWidth: 550,
  },  zoomControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  zoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 4,
  },
  zoomButtonText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#666',
    marginLeft: 3,
  },
  activeButton: {
    backgroundColor: '#e6f7ff',
    borderColor: '#3498db',
    borderWidth: 1,
  },
  activeButtonText: {
    color: '#3498db',
    fontWeight: '600',
  },
  disabledText: {
    color: '#aaa',
  },  boardContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
    height: 380, // Increased height for more board space
    justifyContent: 'center',
    alignItems: 'center',
  },
  board: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    // Center the board within its container when zoomed
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerMarker: {
    width: '50%',
    height: '50%',
    borderRadius: 100,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentPlayerCorner: {
    backgroundColor: '#3498db',
  },
  touchFeedback: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  legalMoveCell: {
    borderColor: '#4CAF50',
    borderWidth: 1.5,
  },
  legalMoveIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  legalMovesInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#e6f7ff',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  legalMovesText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  legalMovesCount: {
    fontWeight: 'bold',
    color: '#3498db',
  },
  instructions: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    width: '90%',
    maxWidth: 500,
  },
  instructionText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  mobileHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    fontStyle: 'italic',
  }
});