import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions, Vibration, Platform, FlatList } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GamePiece, transformPiece } from './GamePieces';

interface PieceSelectorProps {
  pieces: GamePiece[];
  playerColor: string;
  onSelectPiece: (piece: GamePiece & { 
    rotation: number; 
    flipped: boolean; 
    transformedShape: number[][];
  }) => void;
}

export default function PieceSelector({ pieces, playerColor, onSelectPiece }: PieceSelectorProps) {
  const { width } = useWindowDimensions();
  const CELL_SIZE = width < 360 ? 13 : 16;
  const [selectedPiece, setSelectedPiece] = useState<GamePiece | null>(null);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270 degrees
  const [flipped, setFlipped] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rotationPreviews, setRotationPreviews] = useState<Array<{rotation: number, flipped: boolean}>>([]);
  
  // Group pieces by size for better organization
  const groupedPieces = useMemo(() => {
    const groups: {[key: string]: GamePiece[]} = {};
    pieces.forEach(piece => {
      const size = piece.shape.reduce((sum, row) => 
        sum + row.reduce((rowSum, cell) => rowSum + (cell === 1 ? 1 : 0), 0), 0);
      
      const groupKey = `${size} ${size === 1 ? 'cell' : 'cells'}`;
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(piece);
    });
    
    return Object.entries(groups).sort((a, b) => {
      const sizeA = parseInt(a[0].split(' ')[0]);
      const sizeB = parseInt(b[0].split(' ')[0]);
      return sizeA - sizeB;
    });
  }, [pieces]);
  
  // Generate all possible rotation/flip combinations for preview
  useEffect(() => {
    if (selectedPiece) {
      const previews = [
        { rotation: 0, flipped: false },
        { rotation: 90, flipped: false },
        { rotation: 180, flipped: false },
        { rotation: 270, flipped: false },
        { rotation: 0, flipped: true },
      ];
      
      // Filter out duplicates based on the actual shape after transformation
      const uniquePreviews: Array<{rotation: number, flipped: boolean}> = [];
      const shapes: string[] = [];
      
      previews.forEach(preview => {
        const previewShape = transformPiece(selectedPiece.shape, preview.rotation, preview.flipped);
        const shapeStr = JSON.stringify(previewShape);
        
        if (!shapes.includes(shapeStr)) {
          shapes.push(shapeStr);
          uniquePreviews.push(preview);
        }
      });
      
      setRotationPreviews(uniquePreviews);
    } else {
      setRotationPreviews([]);
    }
  }, [selectedPiece]);
  
  const memoizedTransformedShape = useMemo(() => {
    return selectedPiece ? transformPiece(selectedPiece.shape, rotation, flipped) : [];
  }, [selectedPiece, rotation, flipped]);

  useEffect(() => {
    if (selectedPiece) {
      onSelectPiece({
        ...selectedPiece,
        rotation,
        flipped,
        transformedShape: memoizedTransformedShape,
      });
    }
  }, [selectedPiece, rotation, flipped, memoizedTransformedShape, onSelectPiece]);

  const handlePieceSelect = useCallback((piece: GamePiece) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (Platform.OS !== 'web') {
      Vibration.vibrate(10);
    }
    setSelectedPiece(piece);
    setRotation(0);
    setFlipped(false);
  }, []);

  const handleRotate = useCallback(() => {
    if (!selectedPiece) return;
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (Platform.OS !== 'web') {
      Vibration.vibrate(10);
    }
    setRotation(prev => (prev + 90) % 360);
  }, [selectedPiece]);

  const handleFlip = useCallback(() => {
    if (!selectedPiece) return;
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (Platform.OS !== 'web') {
      Vibration.vibrate(10);
    }
    setFlipped(prev => !prev);
  }, [selectedPiece]);
  
  const handlePreviewSelect = useCallback((config: {rotation: number, flipped: boolean}) => {
    setRotation(config.rotation);
    setFlipped(config.flipped);
  }, []);

  const renderPiece = (piece: GamePiece) => {
    const isSelected = selectedPiece && selectedPiece.id === piece.id;
    const pieceSize = Math.max(
      piece.shape.length, 
      piece.shape[0]?.length || 0
    );
    
    // Calculate cell size based on the piece dimensions
    const cellSize = Math.min(
      Math.floor((80 - 10) / pieceSize), // 80px container width, 10px padding
      CELL_SIZE
    );
    
    return (
      <TouchableOpacity
        key={piece.id}
        style={[
          styles.pieceContainer,
          isSelected && styles.selectedPieceContainer
        ]}
        onPress={() => handlePieceSelect(piece)}
        disabled={isLoading || piece.used}
        activeOpacity={0.7}
      >
        {piece.used ? (
          <View style={styles.usedPiece}>
            <Ionicons name="close-circle" size={20} color="#e74c3c" />
          </View>
        ) : (
          <View style={styles.piecePreview}>
            {piece.shape.map((row, rowIndex) => (
              <View key={`row-${piece.id}-${rowIndex}`} style={styles.previewRow}>
                {row.map((cell, cellIndex) => (
                  <View
                    key={`cell-${piece.id}-${rowIndex}-${cellIndex}`}
                    style={[
                      styles.previewCell,
                      { 
                        width: cellSize, 
                        height: cellSize,
                        borderWidth: cellSize > 10 ? 1 : 0.5,
                      },
                      cell === 1 && { backgroundColor: playerColor },
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
        )}
        <Text style={[
          styles.pieceName,
          piece.used && styles.usedText
        ]}>
          {piece.name}
        </Text>
      </TouchableOpacity>
    );
  };
  
  const renderRotationPreview = (preview: {rotation: number, flipped: boolean}, index: number) => {
    if (!selectedPiece) return null;
    
    const previewShape = transformPiece(selectedPiece.shape, preview.rotation, preview.flipped);
    const isActive = rotation === preview.rotation && flipped === preview.flipped;
    
    // Calculate cell size based on the shape dimensions
    const maxDimension = Math.max(
      previewShape.length,
      previewShape[0]?.length || 0
    );
    const cellSize = Math.min(
      Math.floor((60 - 6) / maxDimension), // 60px container width, 6px padding
      12
    );
    
    return (
      <TouchableOpacity
        key={`preview-${index}`}
        style={[
          styles.rotationPreviewContainer,
          isActive && styles.activeRotationPreview
        ]}
        onPress={() => handlePreviewSelect(preview)}
        activeOpacity={0.7}
      >
        <View style={styles.rotationPreview}>
          {previewShape.map((row, rowIndex) => (
            <View key={`prev-row-${index}-${rowIndex}`} style={styles.previewRow}>
              {row.map((cell, cellIndex) => (
                <View
                  key={`prev-cell-${index}-${rowIndex}-${cellIndex}`}
                  style={[
                    styles.rotationPreviewCell,
                    { 
                      width: cellSize, 
                      height: cellSize,
                      borderWidth: cellSize > 8 ? 0.5 : 0,
                    },
                    cell === 1 && { backgroundColor: playerColor },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
        <View style={styles.rotationPreviewLabel}>
          <Text style={styles.rotationDegrees}>{preview.rotation}°</Text>
          {preview.flipped && <MaterialIcons name="flip" size={10} color="#666" />}
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderPieceGroup = (group: [string, GamePiece[]], index: number) => {
    const [groupName, groupPieces] = group;
    
    return (
      <View key={`group-${index}`} style={styles.pieceGroup}>
        <Text style={styles.groupTitle}>{groupName}</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.groupPiecesContainer}
        >
          {groupPieces.map(renderPiece)}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Pieces</Text>
        <Text style={styles.pieceCount}>
          {pieces.filter(p => !p.used).length} remaining
        </Text>
      </View>
      
      <ScrollView style={styles.piecesScroll}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
        ) : (
          groupedPieces.map(renderPieceGroup)
        )}
      </ScrollView>
      
      {selectedPiece && !isLoading && (
        <View style={styles.selectedPieceView}>
          <View style={styles.selectedPieceHeader}>
            <Text style={styles.selectedPieceTitle}>Selected: {selectedPiece.name}</Text>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSelectedPiece(null)}
            >
              <MaterialIcons name="close" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.previewsContainer}>
            <View style={styles.transformedPieceContainer}>
              <View style={styles.transformedPiece}>
                {memoizedTransformedShape.map((row, rowIndex) => (
                  <View key={`t-row-${selectedPiece.id}-${rowIndex}`} style={styles.previewRow}>
                    {row.map((cell, cellIndex) => (
                      <View
                        key={`t-cell-${selectedPiece.id}-${rowIndex}-${cellIndex}`}
                        style={[
                          styles.transformedCell,
                          { width: CELL_SIZE + 4, height: CELL_SIZE + 4 },
                          cell === 1 && { backgroundColor: playerColor },
                        ]}
                      />
                    ))}
                  </View>
                ))}
              </View>
              <View style={styles.rotationLabel}>
                <Text style={styles.rotationText}>
                  {rotation}° {flipped ? '(flipped)' : ''}
                </Text>
              </View>
            </View>
            
            <View style={styles.rotationPreviews}>
              <Text style={styles.rotationPreviewsTitle}>Rotations:</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.rotationPreviewsScroll}
              >
                {rotationPreviews.map(renderRotationPreview)}
              </ScrollView>
            </View>
          </View>
          
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={handleRotate}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={20} color="#333" />
              <Text style={styles.controlText}>Rotate</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={handleFlip}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Ionicons name="swap-horizontal" size={20} color="#333" />
              <Text style={styles.controlText}>Flip</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({  container: {
    marginVertical: 6,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: '98%',
    maxWidth: 550,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pieceCount: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },  piecesScroll: {
    maxHeight: 180, // Reduced height to save vertical space
  },
  loader: {
    marginVertical: 30,
  },
  pieceGroup: {
    marginBottom: 15,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    paddingLeft: 4,
  },
  groupPiecesContainer: {
    paddingHorizontal: 4,
  },
  piecesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  pieceContainer: {
    marginHorizontal: 5,
    padding: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    width: 80,
    minHeight: 80,
    justifyContent: 'center',
  },
  selectedPieceContainer: {
    borderColor: '#3498db',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    transform: [{ scale: 1.05 }],
  },
  piecePreview: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  previewRow: {
    flexDirection: 'row',
  },
  previewCell: {
    borderColor: '#eee',
    backgroundColor: '#f5f5f5',
  },
  pieceName: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '500',
  },
  usedPiece: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    opacity: 0.5,
  },
  usedText: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  selectedPieceView: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  selectedPieceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedPieceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  previewsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transformedPieceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  transformedPiece: {
    padding: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
  },
  transformedCell: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  rotationLabel: {
    marginTop: 4,
  },
  rotationText: {
    fontSize: 12,
    color: '#666',
  },
  rotationPreviews: {
    flex: 1.5,
    paddingLeft: 10,
  },
  rotationPreviewsTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  rotationPreviewsScroll: {
    paddingBottom: 5,
  },
  rotationPreviewContainer: {
    marginRight: 10,
    padding: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    width: 60,
  },
  activeRotationPreview: {
    borderColor: '#3498db',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  rotationPreview: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    height: 40,
  },
  rotationPreviewCell: {
    borderColor: '#eee',
    backgroundColor: '#f5f5f5',
  },
  rotationPreviewLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rotationDegrees: {
    fontSize: 10,
    color: '#666',
    marginRight: 2,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
    width: '100%',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    minWidth: '40%',
  },
  controlText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
});