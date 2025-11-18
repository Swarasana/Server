import { supabase } from "../config/supabase";
import { Level } from "../types";

export class LevelRepository {
  static async getAll(): Promise<Level[]> {
    const { data, error } = await supabase
      .from("levels")
      .select("*")
      .order("minimum_points", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Level | null> {
    const { data, error } = await supabase
      .from("levels")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return data;
  }

  static async getByPoints(points: number): Promise<Level | null> {
    const { data, error } = await supabase
      .from("levels")
      .select("*")
      .lte("minimum_points", points)
      .order("minimum_points", { ascending: false })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  }
}
