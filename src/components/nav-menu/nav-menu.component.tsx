import { Home, Star, Flame, Coins, Users } from 'lucide-react'

export function NavMenu() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 p-4 backdrop-blur-lg z-20">
      <nav className="mx-auto max-w-md">
        <ul className="flex items-center justify-between">
          <li>
            <a
              href="#"
              className="flex flex-col items-center gap-1 text-zinc-400 transition-colors hover:text-zinc-100"
            >
              <Home className="h-6 w-6" />
              <span className="text-sm">Home</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex flex-col items-center gap-1 text-zinc-400 transition-colors hover:text-zinc-100"
            >
              <Star className="h-6 w-6" />
              <span className="text-sm">Star</span>
            </a>
          </li>
          <li className="relative -mt-8">
            <a
              href="#"
              className="flex flex-col items-center gap-1 rounded-full bg-[#DFFE00] p-4 text-black shadow-lg"
            >
              <Flame className="h-6 w-6" />
              <span className="text-sm font-medium">Play</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex flex-col items-center gap-1 text-zinc-400 transition-colors hover:text-zinc-100"
            >
              <Coins className="h-6 w-6" />
              <span className="text-sm">Earn</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex flex-col items-center gap-1 text-zinc-400 transition-colors hover:text-zinc-100"
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Friends</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}
