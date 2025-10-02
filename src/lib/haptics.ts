// Haptic feedback utilities for mobile devices

export const haptics = {
  /**
   * Light tap feedback (for button clicks, selections)
   */
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  },

  /**
   * Medium feedback (for confirmations, success)
   */
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20)
    }
  },

  /**
   * Heavy feedback (for errors, important actions)
   */
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30)
    }
  },

  /**
   * Success pattern (short double vibration)
   */
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10])
    }
  },

  /**
   * Error pattern (longer single vibration)
   */
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  },

  /**
   * Warning pattern (triple short vibration)
   */
  warning: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 30, 10, 30, 10])
    }
  }
}
