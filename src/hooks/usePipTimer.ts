'use client'

/**
 * Manages a Document Picture-in-Picture window for the running timer.
 *
 * Document PiP's requestWindow() requires transient activation (a recent
 * click) — it cannot be opened from a `visibilitychange` handler, so this
 * is a manual pop-out (call `openPip` from a click handler), not a
 * zero-gesture auto-open. Once open, it auto-closes when the tab regains
 * focus or the timer stops. Chrome/Edge 116+ only — `supported` is false
 * everywhere else (Firefox/Safari lack Document PiP).
 */
import { useCallback, useEffect, useState } from 'react'

declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>
      window: Window | null
    }
  }
}

export function usePipTimer(active: boolean) {
  const [pipWindow, setPipWindow] = useState<Window | null>(null)
  const supported = typeof window !== 'undefined' && !!window.documentPictureInPicture

  const openPip = useCallback(async () => {
    if (!supported || window.documentPictureInPicture!.window) return
    try {
      const pip = await window.documentPictureInPicture!.requestWindow({ width: 260, height: 120 })
      pip.document.body.style.margin = '0'
      pip.addEventListener('pagehide', () => setPipWindow(null), { once: true })
      setPipWindow(pip)
    } catch {
      // Denied, or called outside a fresh user gesture — skip silently.
    }
  }, [supported])

  // Close pip when the tab regains focus.
  useEffect(() => {
    if (!pipWindow) return
    const onVisibilityChange = () => {
      if (!document.hidden) {
        pipWindow.close()
        setPipWindow(null)
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [pipWindow])

  // Close pip if the timer stops while it's open.
  useEffect(() => {
    if (!active && pipWindow) {
      pipWindow.close()
      setPipWindow(null)
    }
  }, [active, pipWindow])

  return { pipWindow, openPip, supported }
}
