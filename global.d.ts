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
  ethereum?: {
    isMetaMask?: boolean
    request: (args: { method: string; params?: any[] }) => Promise<any>
  }
  Telegram: {
    WebApp: TelegramWebApp
  }
}
