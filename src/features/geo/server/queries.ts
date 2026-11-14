import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface SpotOption {
  id: string;
  name: string;
}

/** Approved spots for pickers, alphabetical. */
export const getSpotOptions = cache(async (): Promise<SpotOption[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("spots")
    .select("id, name")
    .eq("status", "approved")
    .order("name");
  if (error) throw new Error(`Failed to load spots: ${error.message}`);
  return data;
});
