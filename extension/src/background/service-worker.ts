import { supabase } from '../lib/supabaseClient'
import { getRunningEntry, startTimer, stopTimer } from '../lib/timerService'
import { getLastProjectId } from '../lib/lastProject'
import { initIdleDetection } from './idleDetection'

const ALARM_NAME = 'timesheet-tick'

initIdleDetection()

async function toggleTimer() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return

  const running = await getRunningEntry()
  if (running) {
    await stopTimer(running.id)
  } else {
    const lastProjectId = await getLastProjectId()
    if (!lastProjectId) {
      chrome.notifications.create('timesheet-no-default-project', {
        type: 'basic',
        iconUrl: 'public/icon-128.png',
        title: 'No project selected yet',
        message: 'Open the Timesheet popup once to pick a project — after that the shortcut can start it directly.',
      })
      return
    }
    await startTimer(lastProjectId)
  }
  updateBadge()
}

chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-timer') toggleTimer()
})

const CONTEXT_MENU_ID = 'timesheet-toggle-timer'

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: 'Start/stop Timesheet timer',
    contexts: ['page', 'action'],
  })
})

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === CONTEXT_MENU_ID) toggleTimer()
})

// MV3 service workers unload after ~30s idle — no persistent setInterval.
// chrome.alarms wakes this worker on a schedule instead.
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 })
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) updateBadge()
})

async function updateBadge() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    chrome.action.setBadgeText({ text: '' })
    return
  }

  try {
    const running = await getRunningEntry()
    if (!running) {
      chrome.action.setBadgeText({ text: '' })
      return
    }
    const elapsedMin = Math.floor((Date.now() - new Date(running.start_time).getTime()) / 60000)
    const h = Math.floor(elapsedMin / 60)
    const m = elapsedMin % 60
    chrome.action.setBadgeText({ text: h > 0 ? `${h}h${m}` : `${m}m` })
    chrome.action.setBadgeBackgroundColor({ color: '#16a34a' })
  } catch {
    chrome.action.setBadgeText({ text: '' })
  }
}

updateBadge()
