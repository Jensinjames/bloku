import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface Piece {
  used?: boolean;
}

interface Player {
  id: number;
  name: string;
  color: string;
  score: number;
  pieces: Piece[];
}

interface PlayerInfoProps {
  players: Player[];
  currentPlayer: number;
}

export default function PlayerInfo({ players, currentPlayer }: PlayerInfoProps) {
  const { width } = useWindowDimensions();
  const isMobileSmall = width < 375;
  const isAIPlayer = (player: Player) => player.name.toLowerCase().includes('ai');
  
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Players</Text>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <MaterialCommunityIcons name="robot" size={14} color="#666" />
            <Text style={styles.legendText}>AI Player</Text>
          </View>
          <View style={styles.legendItem}>
            <Ionicons name="person" size={14} color="#666" />
            <Text style={styles.legendText}>Human</Text>
          </View>
        </View>
      </View>
      
      <View style={[
        styles.playersContainer,
        isMobileSmall && styles.playersContainerSmall
      ]}>
        {players.map((player, index) => {
          const isAI = isAIPlayer(player);
          const remainingPieces = player.pieces ? player.pieces.filter(p => !p.used).length : 0;
          const totalPieces = player.pieces ? player.pieces.length : 0;
          const piecePercentage = Math.round((remainingPieces / totalPieces) * 100);
          
          return (
            <View 
              key={player.id} 
              style={[
                styles.playerCard,
                isMobileSmall && styles.playerCardSmall,
                currentPlayer === index && styles.activePlayerCard,
                isAI && styles.aiPlayerCard
              ]}
            >
              <View style={styles.playerHeader}>
                <View style={[styles.colorIndicator, { backgroundColor: player.color }]} />
                <View style={styles.nameContainer}>
                  <Text 
                    style={[
                      styles.playerName,
                      isMobileSmall && styles.playerNameSmall
                    ]}
                    numberOfLines={1}
                  >
                    {player.name}
                  </Text>
                  {isAI ? (
                    <MaterialCommunityIcons name="robot" size={16} color="#666" />
                  ) : (
                    <Ionicons name="person" size={16} color="#666" />
                  )}
                </View>
                {currentPlayer === index && (
                  <View style={styles.turnIndicator}>
                    <Ionicons name="chevron-forward" size={16} color="#3498db" />
                  </View>
                )}
              </View>
              
              <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.statText}>
                    Score: <Text style={styles.statValue}>{player.score}</Text>
                  </Text>
                </View>
                
                <View style={styles.statRow}>
                  <Ionicons name="shapes" size={14} color="#666" />
                  <Text style={styles.statText}>
                    Pieces: <Text style={styles.statValue}>{remainingPieces}/{totalPieces}</Text>
                  </Text>
                </View>
                
                <View style={styles.pieceProgressContainer}>
                  <View style={[styles.pieceProgress, { width: `${piecePercentage}%` }]} />
                </View>
              </View>
            </View>
          );
        })}
      </View>
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
  },  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  playersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  playersContainerSmall: {
    justifyContent: 'center',
  },  playerCard: {
    width: '48%',
    padding: 8,
    marginBottom: 6,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#eee',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  playerCardSmall: {
    width: '100%',
    marginBottom: 6,
  },
  activePlayerCard: {
    borderColor: '#3498db',
    backgroundColor: 'rgba(52, 152, 219, 0.05)',
  },
  aiPlayerCard: {
    borderStyle: 'dashed',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 4,
  },
  playerNameSmall: {
    fontSize: 12,
  },
  turnIndicator: {
    marginLeft: 4,
  },
  statsContainer: {
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  statValue: {
    fontWeight: '600',
    color: '#333',
  },
  pieceProgressContainer: {
    height: 3,
    backgroundColor: '#eee',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  pieceProgress: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
});