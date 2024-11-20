interface TelegramWebApp {
  initData: string
  initDataUnsafe: Record<string, any>
  close: () => void
  ready: () => void
  sendData: (data: string) => void
  expand: () => void
  onEvent: (eventType: string, callback: () => void) => void
  offEvent: (eventType: string, callback: () => void) => void
  platform?: string // Add platform property
}

interface Window {
  Telegram: {
    WebApp: TelegramWebApp
  }
}
