import { getRunningEntry, stopTimer, startTimer } from '../lib/timerService'

// Pattern borrowed from Clockify's browser extension: use the native
// chrome.idle API (OS-level idle signal) instead of DOM activity listeners —
// a background service worker has no DOM to attach listeners to, and
// chrome.idle keeps working even while the popup is closed.
const IDLE_THRESHOLD_MINUTES = 15
const NOTIFICATION_ID = 'timesheet-idle-detected'

const STORAGE_KEYS = {
  idleDetectedAt: 'idleDetectedAt',
  idleEntryId: 'idleEntryId',
} as const

export function initIdleDetection() {
  chrome.idle.setDetectionInterval(IDLE_THRESHOLD_MINUTES * 60)
  chrome.idle.onStateChanged.addListener(handleStateChanged)
  chrome.notifications.onButtonClicked.addListener(handleNotificationButton)
}

async function handleStateChanged(state: chrome.idle.IdleState) {
  if (state === 'idle' || state === 'locked') {
    const running = await getRunningEntry()
    if (!running) return
    await chrome.storage.local.set({
      [STORAGE_KEYS.idleDetectedAt]: Date.now(),
      [STORAGE_KEYS.idleEntryId]: running.id,
    })
    return
  }

  // state === 'active'
  const stored = await chrome.storage.local.get([
    STORAGE_KEYS.idleDetectedAt,
    STORAGE_KEYS.idleEntryId,
  ])
  const idleDetectedAt = stored[STORAGE_KEYS.idleDetectedAt] as number | undefined
  const idleEntryId = stored[STORAGE_KEYS.idleEntryId] as string | undefined
  if (!idleDetectedAt || !idleEntryId) return

  await chrome.storage.local.remove([STORAGE_KEYS.idleDetectedAt, STORAGE_KEYS.idleEntryId])

  const running = await getRunningEntry()
  if (!running || running.id !== idleEntryId) return

  const idleMinutes = Math.round((Date.now() - idleDetectedAt) / 60000)
  chrome.notifications.create(NOTIFICATION_ID, {
    type: 'basic',
    iconUrl: 'public/icon-128.png',
    title: 'Idle time detected',
    message: `You've been idle for ${idleMinutes}m while tracking "${running.project?.name ?? 'a project'}". Discard the idle time?`,
    buttons: [{ title: 'Discard idle time' }, { title: 'Discard & keep tracking' }],
    requireInteraction: true,
  })

  // Stash the running entry snapshot so the button handler doesn't need to
  // re-query it — it may have changed shape by the time the user clicks.
  await chrome.storage.local.set({
    idlePendingEntry: {
      id: running.id,
      projectId: running.project_id,
      description: running.description,
      idleDetectedAt,
    },
  })
}

async function handleNotificationButton(notificationId: string, buttonIndex: number) {
  if (notificationId !== NOTIFICATION_ID) return
  chrome.notifications.clear(NOTIFICATION_ID)

  const stored = await chrome.storage.local.get('idlePendingEntry')
  const pending = stored.idlePendingEntry as
    | { id: string; projectId: string; description: string | null; idleDetectedAt: number }
    | undefined
  if (!pending) return
  await chrome.storage.local.remove('idlePendingEntry')

  await stopTimer(pending.id, new Date(pending.idleDetectedAt))

  if (buttonIndex === 1) {
    // "Discard & keep tracking": start a fresh entry now, same project/description.
    await startTimer(pending.projectId, pending.description ?? undefined)
  }
}
