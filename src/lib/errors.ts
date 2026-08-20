/** Extracts a readable message from a mutation/query error (Supabase PostgrestError, Error, or unknown). */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return String(error)
}
