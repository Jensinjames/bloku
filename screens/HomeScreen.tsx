import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {  const navigation = useNavigation();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const AVAILABLE_COLORS = [
    { id: 'blue', name: 'Blue', color: '#3498db' },
    { id: 'red', name: 'Red', color: '#e74c3c' },
    { id: 'green', name: 'Green', color: '#2ecc71' },
    { id: 'yellow', name: 'Yellow', color: '#f1c40f' },
  ];
  const { width, height } = useWindowDimensions();
  const isSmallDevice = width < 375;  const startGame = (mode: string, colors?: string[]) => {
    navigation.navigate('Game', { mode, selectedColors: colors || [] });
  };

  return (    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI-Powered Blokus</Text>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={styles.welcomeContainer}>
        <Text style={[styles.title, isSmallDevice && styles.titleSmall]}>
          AI-Powered Blokus
        </Text>        {selectedMode === null ? (
          <View style={styles.modeContainer}>
            <TouchableOpacity 
              style={[styles.modeButton, styles.singlePlayerButton]} 
              onPress={() => setSelectedMode('singleplayer')}
              activeOpacity={0.8}
            >
              <Ionicons name="person" size={isSmallDevice ? 24 : 28} color="white" />
              <Text style={styles.modeButtonText}>Single Player</Text>
              <Text style={styles.modeDescription}>Play against AI</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modeButton, styles.multiPlayerButton]} 
              onPress={() => setSelectedMode('multiplayer')}
              activeOpacity={0.8}
            >
              <Ionicons name="people" size={isSmallDevice ? 24 : 28} color="white" />
              <Text style={styles.modeButtonText}>Multiplayer</Text>
              <Text style={styles.modeDescription}>Play with friends</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modeButton, styles.tutorialButton]} 
              onPress={() => setSelectedMode('tutorial')}
              activeOpacity={0.8}
            >
              <Ionicons name="school" size={isSmallDevice ? 24 : 28} color="white" />
              <Text style={styles.modeButtonText}>Tutorial</Text>
              <Text style={styles.modeDescription}>Learn how to play</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.setupContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedMode(null)}>
              <Ionicons name="arrow-back" size={24} color="#333" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.setupTitle}>Game Setup</Text>
            <Text style={styles.setupSubtitle}>
              Mode: {selectedMode === 'singleplayer' ? "Single Player" : selectedMode === 'multiplayer' ? "Multiplayer" : "Tutorial"}
            </Text>
            <Text style={styles.setupPrompt}>Select Your Colors</Text>
            <View style={styles.colorsContainer}>
              {AVAILABLE_COLORS.map(colorOption => {
                const isSelected = selectedColors.includes(colorOption.id);
                return (
                  <TouchableOpacity
                    key={colorOption.id}
                    style={[
                      styles.colorOption,
                      { backgroundColor: colorOption.color },
                      isSelected && styles.colorOptionSelected
                    ]}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedColors(selectedColors.filter(c => c !== colorOption.id));
                      } else {
                        setSelectedColors([...selectedColors, colorOption.id]);
                      }
                    }}
                  >
                    <Text style={styles.colorOptionText}>{colorOption.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={[
                styles.startGameButton,
                selectedColors.length === 0 && styles.startGameButtonDisabled
              ]}
              disabled={selectedColors.length === 0}
              onPress={() => startGame(selectedMode, selectedColors)}
            >
              <Text style={styles.startGameButtonText}>Start Game</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    padding: 8,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2a2a2a',
    marginBottom: 40,
    textAlign: 'center',
  },
  titleSmall: {
    fontSize: 28,
    marginBottom: 30,
  },
  modeContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modeButton: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  singlePlayerButton: {
    backgroundColor: '#007AFF',
  },
  multiPlayerButton: {
    backgroundColor: '#34C759',
  },
  tutorialButton: {
    backgroundColor: '#FF9500',
  },
  modeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  modeDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
  },  gameContainer: {
    flex: 1,
  },
  setupContainer: {
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 5,
  },
  setupTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2a2a2a',
    marginBottom: 10,
  },
  setupSubtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
  },
  setupPrompt: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  colorOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#333',
  },
  colorOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  startGameButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  startGameButtonDisabled: {
    backgroundColor: '#aaa',
  },
  startGameButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});