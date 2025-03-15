import { View, StyleSheet, ScrollView } from 'react-native';

const PLAYER_COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f'];

interface PlayerPiecesProps {
  currentPlayer: number;
}

export default function PlayerPieces({ currentPlayer }: PlayerPiecesProps) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.piecesContainer}>
          {/* Placeholder for pieces - will be implemented in next iteration */}
          {[1, 2, 3, 4, 5].map((piece) => (
            <View
              key={piece}
              style={[
                styles.piece,
                { backgroundColor: PLAYER_COLORS[currentPlayer] },
              ]}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
  piecesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  piece: {
    width: 50,
    height: 50,
    marginHorizontal: 5,
    borderRadius: 8,
  },
});