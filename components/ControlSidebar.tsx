import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ControlSidebarProps {
  onUndo: () => void;
  onPassTurn: () => void;
  onResetGame: () => void;
  closeSidebar: () => void;
}

export default function ControlSidebar({ onUndo, onPassTurn, onResetGame, closeSidebar }: ControlSidebarProps) {
  const offset160 = useRef(new Animated.Value(-160)).current;
  const offset80 = useRef(new Animated.Value(-80)).current;
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  const toggleMenu = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAction = (action: () => void) => {
    action();
    setIsExpanded(false);
    closeSidebar();
  };

  const mainButtonRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const buttonScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const buttonOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const buttonTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        <Animated.View 
          style={[
            styles.menuButton,
            {
              transform: [
                { scale: buttonScale },
                { translateY: Animated.multiply(buttonTranslateY, offset160) }
              ],
              opacity: buttonOpacity
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.actionButton, styles.resetButton]}
            onPress={() => handleAction(onResetGame)}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
            <Text style={styles.buttonLabel}>Reset</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View 
          style={[
            styles.menuButton,
            {
              transform: [
                { scale: buttonScale },
                { translateY: Animated.multiply(buttonTranslateY, offset80) }
              ],
              opacity: buttonOpacity
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.actionButton, styles.passButton]}
            onPress={() => handleAction(onPassTurn)}
          >
            <Ionicons name="skip-forward" size={24} color="#fff" />
            <Text style={styles.buttonLabel}>Pass</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View 
          style={[
            styles.menuButton,
            {
              transform: [
                { scale: buttonScale },
                { translateY: 0 }
              ],
              opacity: buttonOpacity
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.actionButton, styles.undoButton]}
            onPress={() => handleAction(onUndo)}
          >
            <Ionicons name="undo" size={24} color="#fff" />
            <Text style={styles.buttonLabel}>Undo</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity 
          style={styles.mainButton} 
          onPress={toggleMenu}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ rotate: mainButtonRotation }] }}>
            <Ionicons name="add" size={32} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  menuContainer: {
    alignItems: 'center',
  },
  mainButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  menuButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  undoButton: {
    backgroundColor: '#4CAF50',
  },
  passButton: {
    backgroundColor: '#FF9800',
  },
  resetButton: {
    backgroundColor: '#F44336',
  },
  buttonLabel: {
    position: 'absolute',
    right: 60,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: '#fff',
    fontSize: 12,
    width: 50,
    textAlign: 'center',
  },
});