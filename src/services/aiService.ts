/**
 * AI Service - Handles communication with AI microservice
 * Uses fire-and-forget pattern for async summary generation
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY || "";

interface SummaryResponse {
  summary: string;
}

/**
 * Trigger summary generation for a collection (fire-and-forget)
 * This is async and non-blocking - returns immediately
 */
export async function triggerSummaryGeneration(
  collectionId: string
): Promise<void> {
  // Fire and forget - don't wait for response
  fetch(`${AI_SERVICE_URL}/api/v1/summarize/${collectionId}`, {
    method: "POST",
    headers: {
      "X-API-Key": AI_SERVICE_API_KEY,
      "Content-Type": "application/json",
    },
  }).catch((error) => {
    // Log error but don't throw - this is fire-and-forget
    console.error(
      `[AI Service] Failed to trigger summary for collection ${collectionId}:`,
      error.message
    );
  });
}

/**
 * Get summary synchronously (waits for response)
 * Use this if you need the summary immediately
 */
export async function getSummarySync(
  collectionId: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `${AI_SERVICE_URL}/api/v1/summarize/${collectionId}`,
      {
        method: "POST",
        headers: {
          "X-API-Key": AI_SERVICE_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`AI Service returned ${response.status}`);
    }

    const data = (await response.json()) as SummaryResponse;
    return data.summary;
  } catch (error) {
    console.error(
      `[AI Service] Error getting summary for collection ${collectionId}:`,
      error
    );
    return null;
  }
}


