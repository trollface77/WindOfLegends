// Hand-written to match supabase/migrations for Phase 1.
// Once a Supabase project is linked, regenerate with `npm run db:types`.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "13.0.5" };
  public: {
    Tables: {
      regions: {
        Row: { id: string; slug: string; name: string; country_code: string; is_active: boolean; created_at: string };
        Insert: { id?: string; slug: string; name: string; country_code: string; is_active?: boolean; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["regions"]["Insert"]>;
        Relationships: [];
      };
      spots: {
        Row: {
          id: string;
          region_id: string;
          slug: string;
          name: string;
          description: string | null;
          location: unknown;
          status: Database["public"]["Enums"]["spot_status"];
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          region_id: string;
          slug: string;
          name: string;
          description?: string | null;
          location: unknown;
          status?: Database["public"]["Enums"]["spot_status"];
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["spots"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "spots_region_id_fkey"; columns: ["region_id"]; isOneToOne: false; referencedRelation: "regions"; referencedColumns: ["id"] },
        ];
      };
      routes: {
        Row: {
          id: string;
          region_id: string;
          slug: string;
          name: string;
          start_spot_id: string;
          end_spot_id: string;
          distance_km: number | null;
          path: unknown | null;
          status: Database["public"]["Enums"]["spot_status"];
          published_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          region_id: string;
          slug: string;
          name: string;
          start_spot_id: string;
          end_spot_id: string;
          distance_km?: number | null;
          path?: unknown | null;
          status?: Database["public"]["Enums"]["spot_status"];
          published_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["routes"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          home_region_id: string | null;
          home_spot_id: string | null;
          app_role: Database["public"]["Enums"]["app_role"];
          onboarded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: {
          username?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          home_region_id?: string | null;
          home_spot_id?: string | null;
          onboarded_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "profiles_home_spot_id_fkey"; columns: ["home_spot_id"]; isOneToOne: false; referencedRelation: "spots"; referencedColumns: ["id"] },
          { foreignKeyName: "profiles_home_region_id_fkey"; columns: ["home_region_id"]; isOneToOne: false; referencedRelation: "regions"; referencedColumns: ["id"] },
        ];
      };
      rider_preferences: {
        Row: {
          rider_id: string;
          gps_consent: boolean;
          gps_consent_at: string | null;
          show_on_leaderboards: boolean;
          locale: string;
          units: string;
          updated_at: string;
        };
        Insert: never;
        Update: {
          gps_consent?: boolean;
          gps_consent_at?: string | null;
          show_on_leaderboards?: boolean;
          locale?: string;
          units?: string;
        };
        Relationships: [];
      };
      rider_stats: {
        Row: { rider_id: string; lifetime_xp: number; level: number; updated_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      rider_public_profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          home_region_id: string | null;
          home_spot_id: string | null;
          created_at: string;
          lifetime_xp: number;
          level: number;
        };
        Relationships: [
          { foreignKeyName: "profiles_home_spot_id_fkey"; columns: ["home_spot_id"]; isOneToOne: false; referencedRelation: "spots"; referencedColumns: ["id"] },
        ];
      };
    };
    Functions: {
      has_role: { Args: { required: Database["public"]["Enums"]["app_role"] }; Returns: boolean };
    };
    Enums: {
      app_role: "rider" | "moderator" | "admin";
      spot_status: "pending" | "approved" | "rejected";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
