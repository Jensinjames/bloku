export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      game_sessions: {
        Row: {
          id: string;
          user_id: string;
          game_mode: string;
          score: number;
          duration: number | null;
          started_at: string;
          ended_at: string | null;
          winner_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_mode: string;
          score?: number;
          duration?: number | null;
          started_at?: string;
          ended_at?: string | null;
          winner_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_mode?: string;
          score?: number;
          duration?: number | null;
          started_at?: string;
          ended_at?: string | null;
          winner_id?: string | null;
        };
      };
      move_history: {
        Row: {
          id: string;
          game_id: string;
          player_id: string;
          player_color: string;
          piece_id: string;
          position: Json;
          rotation: number;
          score: number;
          move_time: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          player_id: string;
          player_color: string;
          piece_id: string;
          position: Json;
          rotation: number;
          score: number;
          move_time?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          player_id?: string;
          player_color?: string;
          piece_id?: string;
          position?: Json;
          rotation?: number;
          score?: number;
          move_time?: string;
        };
      };
      blokus_pieces: {
        Row: {
          id: number;
          name: string;
          shape: Json;
          cells: number;
          texture: string;
        };
        Insert: {
          id?: number;
          name: string;
          shape: Json;
          cells: number;
          texture: string;
        };
        Update: {
          id?: number;
          name?: string;
          shape?: Json;
          cells?: number;
          texture?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}