import { useState, useEffect, useCallback } from 'react'

export function useScreenWakeLock() {
  const [isLocked, setIsLocked] = useState(false)
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)

  const request = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        const lock = await navigator.wakeLock.request('screen')
        setWakeLock(lock)
        setIsLocked(true)
        lock.addEventListener('release', () => setIsLocked(false))
      }
    } catch (err) {
      console.warn('Wake Lock request failed:', err)
    }
  }, [])

  const release = useCallback(() => {
    if (wakeLock) {
      wakeLock.release()
      setWakeLock(null)
      setIsLocked(false)
    }
  }, [wakeLock])

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && isLocked && !wakeLock) {
        request()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [isLocked, wakeLock, request])

  return { isLocked, request, release }
}
