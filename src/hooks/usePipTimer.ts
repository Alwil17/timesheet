'use client'

/**
 * Opens a Document Picture-in-Picture window automatically when the tab is
 * hidden while `active` (a timer running), and closes it when the tab comes
 * back to the foreground or the timer stops. Chrome/Edge 116+ only — no-ops
 * everywhere else (Document PiP is unsupported in Firefox/Safari).
 */
import { useEffect, useRef, useState } from 'react'

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
  const openingRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.documentPictureInPicture) return

    const openPip = async () => {
      if (openingRef.current || window.documentPictureInPicture!.window) return
      openingRef.current = true
      try {
        const pip = await window.documentPictureInPicture!.requestWindow({ width: 260, height: 120 })
        pip.document.body.style.margin = '0'
        pip.addEventListener('pagehide', () => setPipWindow(null), { once: true })
        setPipWindow(pip)
      } catch {
        // Denied, or no user-activation in this browser session — skip silently.
      } finally {
        openingRef.current = false
      }
    }

    const closePip = () => {
      window.documentPictureInPicture?.window?.close()
      setPipWindow(null)
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (active) openPip()
      } else {
        closePip()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [active])

  // Close pip if the timer stops while it's open.
  useEffect(() => {
    if (!active && pipWindow) {
      pipWindow.close()
      setPipWindow(null)
    }
  }, [active, pipWindow])

  return pipWindow
}
