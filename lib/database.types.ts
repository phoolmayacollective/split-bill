export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      bills: {
        Row: {
          created_at: string;
          id: string;
          items: Json;
          kdf_iterations: number | null;
          payment_enc: string | null;
          payment_iv: string | null;
          payment_salt: string | null;
          totals: Json;
        };
        Insert: {
          created_at?: string;
          id?: string;
          items?: Json;
          kdf_iterations?: number | null;
          payment_enc?: string | null;
          payment_iv?: string | null;
          payment_salt?: string | null;
          totals?: Json;
        };
        Update: {
          created_at?: string;
          id?: string;
          items?: Json;
          kdf_iterations?: number | null;
          payment_enc?: string | null;
          payment_iv?: string | null;
          payment_salt?: string | null;
          totals?: Json;
        };
        Relationships: [];
      };
      claims: {
        Row: {
          bill_id: string;
          created_at: string;
          id: string;
          item_id: string;
          ower_name: string;
          share: number;
        };
        Insert: {
          bill_id: string;
          created_at?: string;
          id?: string;
          item_id: string;
          ower_name: string;
          share?: number;
        };
        Update: {
          bill_id?: string;
          created_at?: string;
          id?: string;
          item_id?: string;
          ower_name?: string;
          share?: number;
        };
        Relationships: [
          {
            foreignKeyName: "claims_bill_id_fkey";
            columns: ["bill_id"];
            isOneToOne: false;
            referencedRelation: "bills";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type BillItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export type BillTotals = {
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
};

export type BillRow = Database["public"]["Tables"]["bills"]["Row"];
export type BillInsert = Database["public"]["Tables"]["bills"]["Insert"];
export type ClaimRow = Database["public"]["Tables"]["claims"]["Row"];
export type ClaimInsert = Database["public"]["Tables"]["claims"]["Insert"];

export type BillWithClaims = BillRow & {
  claims: ClaimRow[];
};
