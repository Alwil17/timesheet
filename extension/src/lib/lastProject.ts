const KEY = 'lastProjectId'

export async function getLastProjectId(): Promise<string | null> {
  const result = await chrome.storage.local.get(KEY)
  return result[KEY] ?? null
}

export async function setLastProjectId(projectId: string): Promise<void> {
  await chrome.storage.local.set({ [KEY]: projectId })
}
