import Image from 'next/image'

export function NavMenu() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white/10"
      style={{
        backgroundImage: `url('https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/flappymode/bgmarine')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <nav className="mx-auto max-w-md bg-zinc-900 backdrop-blur-sm py-2">
        <ul className="flex items-center justify-around">
          <li>
            <a
              href="#"
              className="flex flex-col items-center text-zinc-400 transition-colors hover:text-zinc-100"
            >
              <button className=" text-black px-4 py-2">
                <Image
                  src="https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/flappymode/earnbtn"
                  alt="earn Game"
                  width={80}
                  height={80}
                  className="w-auto h-14"
                  style={{
                    filter: 'drop-shadow(1px 5px 5px rgb(147 197 253 / 0.6))',
                  }}
                />
              </button>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex flex-col items-center gap-1 rounded-full bg-[#DFFE00]/0 p-4 text-black w-28 h-10"
            ></a>
          </li>

          <li>
            <a
              href="#"
              className="flex flex-col items-center gap-1 text-zinc-400 transition-colors hover:text-zinc-100"
            >
              <button className=" text-black px-4 py-3">
                <Image
                  src="https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/flappymode/rankingbtn"
                  alt="ranking Game"
                  width={80}
                  height={80}
                  className="w-auto h-14"
                  style={{
                    filter: 'drop-shadow(1px 5px 5px rgb(147 197 253 / 0.6))',
                  }}
                />
              </button>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}
