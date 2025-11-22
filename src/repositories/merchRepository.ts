import { supabase } from "../config/supabase";
import { Merch } from "../types";

export class MerchRepository {
  static async getAll(): Promise<Merch[]> {
    const { data, error } = await supabase.from("merch").select("*");

    if (error) throw error;
    return data || [];
  }
}
