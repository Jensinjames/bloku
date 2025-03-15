import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { toast } from 'sonner-native';

interface AIAssistantProps {
  currentPlayer: number;
  gameState?: any;
  onClose?: () => void;
}

export default function AIAssistant({ onClose }: AIAssistantProps) {
  const { width } = useWindowDimensions();
  const [isThinking, setIsThinking] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);

  const getAIAdvice = async () => {
    setIsThinking(true);
    try {
      const response = await fetch('https://api.a0.dev/ai/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a Blokus AI assistant providing brief, strategic advice.',
            },            {
              role: 'user',
              content: `What's a good opening move in Blokus?`,
            },
          ],
        }),
      });
      const data = await response.json();
      if (data?.completion) {
        setAdvice(data.completion);
      }    } catch (error) {
      toast.error(`Error getting AI advice: ${error}`);
    } finally {
      setIsThinking(false);
    }
  };  
  
  return (
    <View style={[
      styles.assistantContainer, 
      { width: Math.min(width * 0.9, 350) }
    ]}>
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={() => onClose && onClose()}
        hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
      >
        <MaterialIcons name="close" size={24} color="#007AFF" />
      </TouchableOpacity>
      
      <View style={styles.contentContainer}>
        <TouchableOpacity 
          style={[styles.adviceButton, isThinking && styles.disabledButton]} 
          onPress={getAIAdvice}
          disabled={isThinking}
        >
          <MaterialIcons name="lightbulb" size={24} color={isThinking ? "#999" : "#007AFF"} />
          <Text style={[styles.text, isThinking && styles.disabledText]}>
            {isThinking ? "Thinking..." : "Get AI Advice"}
          </Text>
        </TouchableOpacity>
        
        {isThinking && (
          <ActivityIndicator style={styles.loader} size="small" color="#007AFF" />
        )}
        
        {advice && !isThinking && (
          <View style={styles.adviceContainer}>
            <Text style={styles.adviceText}>{advice}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  assistantContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 70,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 1000,
  },
  contentContainer: {
    width: '100%',
  },
  adviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#f5f5f5',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 5,
    marginBottom: 10,
  },
  text: {
    marginLeft: 8,
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledText: {
    color: '#999',
  },
  loader: {
    marginVertical: 15,
  },
  adviceContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  adviceText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  }
});