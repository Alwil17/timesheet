// Implements Supabase's Storage interface over chrome.storage.local so the
// extension's session survives service-worker restarts (localStorage isn't
// available to MV3 service workers, and popup-only storage would drop the
// session every time the popup closes).
export const chromeStorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    const result = await chrome.storage.local.get(key)
    return result[key] ?? null
  },
  async setItem(key: string, value: string): Promise<void> {
    await chrome.storage.local.set({ [key]: value })
  },
  async removeItem(key: string): Promise<void> {
    await chrome.storage.local.remove(key)
  },
}
