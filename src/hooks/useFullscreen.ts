import { useState, useCallback } from 'react'

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const enter = useCallback(() => {
    const el = document.documentElement
    if (el.requestFullscreen) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else if ((el as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen) {
      (el as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen()
      setIsFullscreen(true)
    }
  }, [])

  const exit = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    } else if ((document as unknown as { webkitExitFullscreen: () => void }).webkitExitFullscreen) {
      (document as unknown as { webkitExitFullscreen: () => void }).webkitExitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const toggle = useCallback(() => {
    if (document.fullscreenElement) exit()
    else enter()
  }, [enter, exit])

  return { isFullscreen, enter, exit, toggle }
}
