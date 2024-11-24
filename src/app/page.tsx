'use client'

import { useEffect } from 'react'

import { FlappyModeGame } from '@/components/flappy-card'
import { Card, CardContent } from '@/components/ui/card'

export default function FlappyMode() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp
      webApp.ready()
      setTimeout(() => {
        webApp.expand()
      }, 100)
    }
  }, [])

  return (
    <div className="min-h-screen bg-blue-300/60 backdrop-blur-sm">
      <div className="mx-auto max-w-2xl flex flex-col gap-2 items-center">
        <Card className="w-full h-[600px] border-none">
          <CardContent className="p-0 h-full flex">
            <FlappyModeGame />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
