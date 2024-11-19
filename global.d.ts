export {}

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string
        initDataUnsafe: Record<string, any>
        close: () => void
        ready: () => void
        sendData: (data: string) => void
        expand: () => void
        onEvent: (eventType: string, callback: () => void) => void
        offEvent: (eventType: string, callback: () => void) => void
        // Agrega más métodos si los necesitas
      }
    }
  }
}
