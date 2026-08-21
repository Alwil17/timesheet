import { supabase } from '../lib/supabaseClient'
import { getRunningEntry, startTimer, stopTimer } from '../lib/timerService'
import { getLastProjectId } from '../lib/lastProject'
import { initIdleDetection } from './idleDetection'

const ALARM_NAME = 'timesheet-tick'
const REMINDER_ALARM_NAME = 'timesheet-forgot-reminder'
const REMINDER_NOTIFICATION_ID = 'timesheet-forgot-notification'
const WORK_HOURS = { start: 9, end: 18 } // local time, Mon–Fri

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
  chrome.alarms.create(REMINDER_ALARM_NAME, { periodInMinutes: 30 })
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) updateBadge()
  if (alarm.name === REMINDER_ALARM_NAME) checkForgotToTrack()
})

function isWorkHours(): boolean {
  const now = new Date()
  const day = now.getDay()
  if (day === 0 || day === 6) return false
  return now.getHours() >= WORK_HOURS.start && now.getHours() < WORK_HOURS.end
}

async function checkForgotToTrack() {
  if (!isWorkHours()) return

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return

  const running = await getRunningEntry()
  if (running) return

  chrome.notifications.create(REMINDER_NOTIFICATION_ID, {
    type: 'basic',
    iconUrl: 'public/icon-128.png',
    title: 'No timer running',
    message: "You haven't tracked time in a while. Start a timer?",
    buttons: [{ title: 'Start last project' }],
  })
}

chrome.notifications.onButtonClicked.addListener(async (notificationId) => {
  if (notificationId !== REMINDER_NOTIFICATION_ID) return
  const lastProjectId = await getLastProjectId()
  if (lastProjectId) await startTimer(lastProjectId)
  chrome.notifications.clear(REMINDER_NOTIFICATION_ID)
  updateBadge()
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
