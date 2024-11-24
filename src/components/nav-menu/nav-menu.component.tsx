'use client'

import { usePathname } from 'next/navigation' // Cambia useRouter por usePathname
import { Crown, Shell, ListCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function NavMenu() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800">
      <div className="flex justify-around py-4 relative">
        <div className="absolute bottom-4 left-4">
          <Link href="/">
            <Image
              src="https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/flappymode/homebtn"
              alt="home"
              width={100}
              height={100}
              className="w-auto h-24"
              style={{
                filter: 'drop-shadow(1px 5px 5px rgb(147 197 253 / 0.6))',
              }}
            />
          </Link>
        </div>

        <div className="flex justify-around flex-1 pl-24">
          <Link
            href="/"
            className={`flex flex-col items-center ${
              isActive('/') ? 'text-[#DFFE00]' : 'text-gray-400'
            }`}
          >
            <Shell className="h-6 w-6" />
            <span className="text-sm">Game</span>
          </Link>
          <Link
            href="/earn"
            className={`flex flex-col items-center ${
              isActive('/earn') ? 'text-[#DFFE00]' : 'text-gray-400'
            }`}
          >
            <ListCheck className="h-6 w-6" />
            <span className="text-sm">Task</span>
          </Link>
          <Link
            href="/ranking"
            className={`flex flex-col items-center ${
              isActive('/ranking') ? 'text-[#DFFE00]' : 'text-gray-400'
            }`}
          >
            <Crown className="h-6 w-6" />
            <span className="text-sm">Rankings</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
