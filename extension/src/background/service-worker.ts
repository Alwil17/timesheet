import { supabase } from '../lib/supabaseClient'
import { getRunningEntry } from '../lib/timerService'

const ALARM_NAME = 'timesheet-tick'

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
