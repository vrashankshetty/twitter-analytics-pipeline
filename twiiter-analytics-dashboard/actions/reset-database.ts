"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function resetDatabase() {
  try {
    const supabase = createClient()

    // List of tables to truncate
    const tables = ["tweets", "month_summary", "language_summary", "sentiment_summary", "performance"]

    const { error } = await supabase.from(tables[0]).delete().gt("processed_at", "2004-10-03T00:00:00Z");

    if (error) {
        console.error(`Error truncating ${tables[0]}:`, error)
        throw new Error(`Failed to truncate ${tables[0]}: ${error.message}`)
      }

    const { error:merror } = await supabase.from(tables[1]).delete().gt("last_updated", "2004-10-03T00:00:00Z");

    if (merror) {
          console.error(`Error truncating ${tables[1]}:`, merror)
          throw new Error(`Failed to truncate ${tables[1]}: ${merror.message}`)
    }

    const { error:lerror } = await supabase.from(tables[2]).delete().gt("last_updated", "2004-10-03T00:00:00Z");

    if (lerror) {
          console.error(`Error truncating ${tables[2]}:`, lerror)
          throw new Error(`Failed to truncate ${tables[2]}: ${lerror.message}`)
    }

    const { error:serror } = await supabase.from(tables[3]).delete().gt("last_updated", "2004-10-03T00:00:00Z");

    if (serror) {
          console.error(`Error truncating ${tables[3]}:`, serror)
          throw new Error(`Failed to truncate ${tables[3]}: ${serror.message}`)
    }

    const { error:perror } = await supabase.from(tables[4]).delete().gt("recorded_at", "2004-10-03T00:00:00Z");

    if (perror) {
          console.error(`Error truncating ${tables[4]}:`, perror)
          throw new Error(`Failed to truncate ${tables[4]}: ${perror.message}`)
    }
  


    revalidatePath("/")

    return { success: true, message: "Database reset successfully" }
  } catch (error) {
    console.error("Error resetting database:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to reset database",
    }
  }
}
