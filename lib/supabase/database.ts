import type { ReviewStatus } from '@/lib/pitch'

export type RegistrationRow = {
  id: string; submitted_at: string; first_name: string; last_name: string;
  email: string; business_stage: string; reason: string; reason_details: string;
  needs_business_help: string; location: string; university: string;
}
export type PitchRow = {
  id: string; submitted_at: string; founder_name: string; email: string; phone: string;
  business_name: string; sector: string; stage: string; location: string; summary: string;
  customers: string; revenue_model: string; turnover: string; launch_plan: string;
  support_needed: string; deck_path: string; deck_name: string; status: ReviewStatus;
  notes: string; reviewed_at: string | null;
}
type Table<Row, Insert = Partial<Row>> = {
  Row: Row; Insert: Insert; Update: Partial<Row>; Relationships: [];
}
type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Matches supabase/migrations/20261001000000_eea.sql.
export type Database = {
  public: {
    Tables: {
      eea_registrations: Table<RegistrationRow, Omit<RegistrationRow, 'id' | 'submitted_at'>>;
      eea_pitches: Table<PitchRow>;
      eea_settings: Table<{ id: number; pitches_open: boolean; updated_at: string }>;
      eea_admins: Table<{ user_id: string; created_at: string }>;
    };
    Views: { [_ in never]: never };
    Functions: { eea_submit_pitch: { Args: { payload: Json }; Returns: string } };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
