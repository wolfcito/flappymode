'use client'

import React, { CSSProperties, useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { format } from 'numerable'
import { supabase } from '@/lib/supabase-client'

const GRAVITY = 0.3
const JUMP_STRENGTH = 6
const CANDLE_WIDTH = 40
const CANDLE_GAP = 250
const INITIAL_SPEED = 2
const SPEED_INCREMENT = 0.5
const HEIGHT_STAGE = 600
const PLAYER_HEIGHT = 60
const PLAYER_WIDTH = 60
const COLLISION_MARGIN = 5

interface Candle {
  x: number
  height: number
  isTop: boolean
  isGreen: boolean
}

interface StartScreenProps {
  readonly playerName: string
  readonly setPlayerName: (value: string) => void
  // readonly selectedBird: string
  readonly setSelectedBird: (value: string) => void
  readonly setGameStarted: (value: boolean) => void
}

export function FlappyModeGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [playerPosition, setPlayerPosition] = useState(350)
  const [playerVelocity, setPlayerVelocity] = useState(0)
  const [candles, setCandles] = useState<Candle[]>([])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameSpeed, setGameSpeed] = useState(INITIAL_SPEED)
  const [level, setLevel] = useState(1)
  const [selectedBird, setSelectedBird] = useState('bird1')
  const [playerName, setPlayerName] = useState('Chad')
  // const [highScores, setHighScores] = useState<
  //   { nickname: string; score: number }[]
  // >([])
  const [scoreUpdated, setScoreUpdated] = useState(false)
  // const [showEarnScreen, setShowEarnScreen] = useState(false)
  // const [showRankingScreen, setShowRankingScreen] = useState(false)

  const jump = useCallback(() => {
    if (!gameOver && gameStarted) {
      setPlayerVelocity(-JUMP_STRENGTH)
    }
  }, [gameOver, gameStarted])

  useEffect(() => {
    if (!gameStarted) return

    let lastLevel = level

    const gameLoop = setInterval(() => {
      if (gameOver) return

      // Actualizar la posición del jugador y aplicar colisión con límites del juego
      setPlayerPosition((prevPosition) => {
        const newPosition = prevPosition + playerVelocity
        if (newPosition > HEIGHT_STAGE || newPosition < 0) {
          handleGameOver()
          return prevPosition
        }
        return newPosition
      })

      // Aplicar gravedad para un movimiento más natural
      setPlayerVelocity((prevVelocity) => prevVelocity * 0.98 + GRAVITY)

      // Mueve los obstáculos hacia la izquierda y elimina los que salen de pantalla
      setCandles((prevCandles) => {
        const newCandles = prevCandles
          .map((candle) => ({ ...candle, x: candle.x - gameSpeed }))
          .filter((candle) => candle.x > -CANDLE_WIDTH)

        // Genera un nuevo obstáculo si el último obstáculo está a una distancia específica
        if (
          newCandles.length === 0 ||
          newCandles[newCandles.length - 1].x < innerWidth - CANDLE_GAP
        ) {
          const height = Math.random() * 200 + 100

          // Calcula una posición inicial dinámica dependiendo del tamaño de la pantalla
          const initialX = Math.min(
            innerWidth - 50,
            innerWidth - CANDLE_GAP / 2,
          )

          newCandles.push(
            {
              x: initialX,
              height,
              isTop: true,
              isGreen: Math.random() > 0.5,
            },
            {
              x: initialX,
              height: HEIGHT_STAGE - height - CANDLE_GAP,
              isTop: false,
              isGreen: Math.random() > 0.5,
            },
          )
        }

        return newCandles
      })

      // Incrementa el puntaje y ajusta la velocidad del juego al alcanzar ciertos puntos
      setScore((prevScore) => {
        const newScore = prevScore + 1
        if (newScore % 1000 === 0 && lastLevel === level) {
          setGameSpeed((prevSpeed) => prevSpeed + SPEED_INCREMENT)
          setLevel((prevLevel) => prevLevel + 1)
          lastLevel++
        }
        return newScore
      })

      // Detecta colisiones entre el jugador y los obstáculos
      candles.forEach((candle) => {
        if (
          candle.x < 50 + PLAYER_WIDTH - COLLISION_MARGIN && // Borde derecho del pájaro con margen
          candle.x + CANDLE_WIDTH > 50 + COLLISION_MARGIN && // Borde izquierdo del pájaro con margen
          ((candle.isTop &&
            playerPosition < candle.height - COLLISION_MARGIN) || // Colisión con obstáculo superior ajustado
            (!candle.isTop &&
              playerPosition + PLAYER_HEIGHT >
                600 - candle.height + COLLISION_MARGIN)) // Colisión con obstáculo inferior ajustado
        ) {
          handleGameOver()
        }
      })
    }, 1000 / 60)

    return () => clearInterval(gameLoop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gameStarted,
    playerPosition,
    playerVelocity,
    candles,
    gameOver,
    gameSpeed,
    level,
  ])

  const resetGame = () => {
    setPlayerPosition(250)
    setPlayerVelocity(0)
    setCandles([])
    setScore(0)
    setGameOver(false)
    setGameStarted(false)
    setGameSpeed(INITIAL_SPEED)
    setLevel(1)
  }

  const handleGameOver = async () => {
    setGameOver(true)

    try {
      const { data: currentScore, error: fetchError } = await supabase
        .from('flappymodeV2')
        .select('score')
        .eq('nickname', playerName)
        .maybeSingle()

      if (fetchError) {
        console.error('Error fetching current score:', fetchError.message)
        return
      }

      if (!currentScore) {
        const { data: newScoreData, error: insertError } = await supabase
          .from('flappymodeV2')
          .insert({ nickname: playerName, score })
        console.log('newScoreData', newScoreData)
        if (insertError) {
          console.error(
            'Error creating new player record:',
            insertError.message,
          )
          return
        }
        setScoreUpdated(true)
      } else if (score > currentScore.score) {
        const { data, error: upsertError } = await supabase
          .from('flappymodeV2')
          .upsert({ nickname: playerName, score })
        console.log('data', data)
        if (upsertError) {
          console.error('Error updating score:', upsertError.message)
        } else {
          setScoreUpdated(true)
        }
      } else {
        setScoreUpdated(false)
      }

      const { data: scores, error: fetchHighScoresError } = await supabase
        .from('flappymodeV2')
        .select('*')
        .order('score', { ascending: false })
        .limit(10)

      if (fetchHighScoresError) {
        console.error(
          'Error fetching high scores:',
          fetchHighScoresError.message,
        )
      } else {
        // setHighScores(scores || [])
        console.error('scores', scores)
      }
    } catch (error) {
      console.error('Unexpected error in handleGameOver:', error)
    }
  }

  return (
    <div
      className="relative flex flex-col bg-white/10 items-end justify-center w-full"
      style={{
        backgroundImage: `url('https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/flappymode/bgmarine')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div onClick={gameStarted ? jump : undefined}>
        {!gameStarted && !gameOver && (
          <StartScreen
            setPlayerName={setPlayerName}
            playerName={playerName}
            setGameStarted={setGameStarted}
            // selectedBird={selectedBird}
            setSelectedBird={setSelectedBird}
          />
        )}

        {gameOver ? (
          <div className="absolute inset-0 flex flex-col items-center justify-between px-4 py-8 bg-blue-300/60 backdrop-blur-sm z-20">
            <h2
              className="text-4xl text-[#DFFE00] mb-4"
              style={{
                textShadow: '1px 1px 1px #293B94, -1px -1px 1px #293B94',
              }}
            >
              Game Over
            </h2>
            <div className="text-center p-3 justify-center items-center flex flex-col h-max-[250px] w-full">
              <Image
                src={
                  selectedBird === 'bird1'
                    ? 'https://res.cloudinary.com/guffenix/image/upload/f_gif,q_auto,e_loop/v1/flappymode/avatar001'
                    : selectedBird === 'bird2'
                    ? 'https://res.cloudinary.com/guffenix/image/upload/f_gif,q_auto,e_loop/v1/flappymode/avatar002'
                    : 'https://res.cloudinary.com/guffenix/image/upload/f_gif,q_auto,e_loop/v1/flappymode/avatar005'
                }
                alt="Selected Bird"
                width={80}
                height={80}
                className="rounded-full h-28 w-auto"
              />
              <p className="mb-4 text-lg text-white">{`Score: ${format(
                score,
                '0.00 a',
              )}`}</p>
            </div>

            {scoreUpdated && (
              <div>
                <p className="text-center text-lg text-[#DFFE00] mb-4 px-3">{`"Mode is good, Mode is great,`}</p>
                <p className="text-center text-lg text-[#DFFE00] mb-4 px-3">{`we trust its power as of this date."`}</p>
              </div>
            )}

            <button onClick={resetGame} className="py-14">
              <Image
                src="https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/flappymode/restartbtn"
                alt="Restart Game"
                width={80}
                height={80}
                className="w-auto h-28"
                style={{
                  filter: 'drop-shadow(1px 5px 5px rgb(147 197 253 / 0.6))',
                }}
              />
            </button>
          </div>
        ) : null}

        {gameStarted ? (
          <div className="absolute inset-0 flex flex-col items-center justify-between p-4 bg-black/20 overflow-hidden">
            <div
              className="w-auto h-16 absolute shadow-2xl rounded-full z-10"
              style={{ top: playerPosition, left: 50 }}
            >
              <Image
                src={
                  selectedBird === 'bird1'
                    ? 'https://res.cloudinary.com/guffenix/image/upload/f_gif,q_auto,e_loop/v1/flappymode/avatar001'
                    : selectedBird === 'bird2'
                    ? 'https://res.cloudinary.com/guffenix/image/upload/f_gif,q_auto,e_loop/v1/flappymode/avatar002'
                    : 'https://res.cloudinary.com/guffenix/image/upload/f_gif,q_auto,e_loop/v1/flappymode/avatar005'
                }
                alt="Selected Bird"
                width={PLAYER_WIDTH}
                height={PLAYER_HEIGHT}
                className="h-20 w-auto"
                style={{ filter: 'drop-shadow(5px 0px 10px #DFFE00)' }}
              />
            </div>

            {candles.map((candle, index) => {
              const candleStyle: CSSProperties & { '--final-height'?: string } =
                {
                  '--final-height': `${candle.height}px`,
                  backgroundImage: `url(${
                    candle.isTop
                      ? 'https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/flappymode/top-obstacle'
                      : 'https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/flappymode/bottom-obstacle'
                  })`,
                  backgroundRepeat: 'repeat-y',
                  backgroundSize: `${CANDLE_WIDTH}px auto`,
                  backgroundPosition: candle.isTop ? 'bottom' : 'top',
                  left: candle.x,
                  width: CANDLE_WIDTH,
                  height: '0', // Empieza con altura 0 para que crezca con la animación
                  position: 'absolute',
                  overflow: 'hidden',
                  borderRadius: candle.isTop
                    ? '10px 10px 0 0'
                    : '0 0 10px 10px',
                  userSelect: 'none',
                  transformOrigin: candle.isTop ? 'top' : 'bottom',
                  animation: candle.isTop
                    ? 'growFromTop 0.5s forwards'
                    : 'growFromBottom 0.5s forwards',
                  top: candle.isTop ? '0' : undefined, // Solo establece `top` para los obstáculos superiores
                  bottom: candle.isTop ? undefined : '0', // Solo establece `bottom` para los obstáculos inferiores
                }

              return <div key={index} style={candleStyle} />
            })}

            <div
              className="absolute mb-8 top-0 left-0 flex flex-col gap-2 font-bold text-[#DFFE00] md:text-lg text-sm"
              style={{ left: 20, userSelect: 'none' }}
            >
              <div className="flex items-center gap-2">{`Score: ${score}`}</div>
              <div className="flex items-center gap-2">Level: {level}</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// function StartScreen({
//   playerName,
//   setPlayerName,
//   selectedBird,
//   setSelectedBird,
//   setGameStarted,
// }: StartScreenProps) {
//   const [isInputFocused, setIsInputFocused] = useState(false)
//   return (
//     <div className="absolute inset-0 flex flex-col items-center h-full z-10 bg-blue-300/60 backdrop-blur-sm">
//       <div
//         className={`p-2 rounded flex flex-col justify-center items-center ${
//           isInputFocused ? 'border border-[#DFFE00]' : ''
//         }`}
//       >
//         {/* <label
//           className="text-[#DFFE00]"
//           style={{
//             textShadow: '1px 1px 2px #293B94, -1px -1px 2px #293B94',
//           }}
//         >
//           Welcome,
//         </label> */}
//         <input
//           type="text"
//           value={playerName}
//           onChange={(e) => setPlayerName(e.target.value)}
//           onClick={(e) => e.stopPropagation()}
//           onFocus={() => setIsInputFocused(true)}
//           onBlur={() => setIsInputFocused(false)}
//           className={`px-2 py-14 outline-none bg-transparent text-[#DFFE00] text-4xl uppercase text-center `}
//           style={{
//             textShadow: '1px 1px 1px #293B94, -1px -1px 1px #293B94',
//           }}
//           maxLength={20}
//         />
//       </div>
//       <div>
//         <div className="text-[#DFFE00] text-center pb-2">Choose yours!</div>
//         <div className="flex gap-2 my-3">
//           <Image
//             src="https://res.cloudinary.com/guffenix/image/upload/f_gif,q_auto,e_loop/v1/flappymode/avatar001"
//             alt="Bird 1"
//             width={PLAYER_WIDTH}
//             height={PLAYER_HEIGHT}
//             className={`cursor-pointer w-auto h-[80px]`}
//             style={{
//               filter:
//                 selectedBird === 'bird1'
//                   ? 'drop-shadow(0px 0px 5px #DFFE00)'
//                   : 'grayscale(100%)',
//             }}
//             onClick={() => setSelectedBird('bird1')}
//           />
//           <Image
//             src="https://res.cloudinary.com/guffenix/image/upload/f_gif,q_auto,e_loop/v1/flappymode/avatar002"
//             alt="Bird 2"
//             width={60}
//             height={60}
//             className={`cursor-pointer w-auto h-[80px]`}
//             style={{
//               filter:
//                 selectedBird === 'bird2'
//                   ? 'drop-shadow(0px 0px 5px #DFFE00)'
//                   : 'grayscale(100%)',
//             }}
//             onClick={() => setSelectedBird('bird2')}
//           />
//           <Image
//             src="https://res.cloudinary.com/guffenix/image/upload/f_gif,q_auto,e_loop/v1/flappymode/avatar005"
//             alt="Bird 3"
//             width={60}
//             height={60}
//             className={`cursor-pointer w-auto h-[80px]`}
//             style={{
//               filter:
//                 selectedBird === 'bird3'
//                   ? 'drop-shadow(0px 0px 5px #DFFE00)'
//                   : 'grayscale(100%)',
//             }}
//             onClick={() => setSelectedBird('bird3')}
//           />
//         </div>
//         <p className="mt-4 text-sm text-slate-100 text-center italic font-semibold">{`tap - tap - tap!`}</p>
//       </div>

//       <button
//         className="py-14"
//         onClick={() => {
//           if (selectedBird && playerName) {
//             setGameStarted(true)
//           } else {
//             alert('Please enter your name and select a bird.')
//           }
//         }}
//       >
//         <Image
//           src="https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/flappymode/playbtn"
//           alt="Flappy Play"
//           width={80}
//           height={80}
//           className="w-auto h-28"
//           style={{ filter: 'drop-shadow(1px 5px 5px rgb(147 197 253 / 0.6))' }}
//         />
//       </button>
//     </div>
//   )
// }

function StartScreen({
  playerName,
  setPlayerName,
  setSelectedBird,
  setGameStarted,
}: StartScreenProps) {
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [avatarIndex, setAvatarIndex] = useState(0)

  // Avatars disponibles
  const avatars = [
    {
      id: 'bird1',
      src: 'https://res.cloudinary.com/guffenix/image/upload/f_gif,q_auto,e_loop/v1/flappymode/avatar001',
    },
    {
      id: 'bird2',
      src: 'https://res.cloudinary.com/guffenix/image/upload/f_gif,q_auto,e_loop/v1/flappymode/avatar002',
    },
    {
      id: 'bird3',
      src: 'https://res.cloudinary.com/guffenix/image/upload/f_gif,q_auto,e_loop/v1/flappymode/avatar005',
    },
  ]

  // Funciones para navegar entre avatars
  const handlePreviousAvatar = () => {
    setAvatarIndex((prevIndex) =>
      prevIndex === 0 ? avatars.length - 1 : prevIndex - 1,
    )
  }

  const handleNextAvatar = () => {
    setAvatarIndex((prevIndex) =>
      prevIndex === avatars.length - 1 ? 0 : prevIndex + 1,
    )
  }

  // Actualizamos el avatar seleccionado
  useEffect(() => {
    setSelectedBird(avatars[avatarIndex].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarIndex, setSelectedBird])

  return (
    <div className="absolute inset-0 flex flex-col items-center h-full z-10 bg-blue-300/60 backdrop-blur-sm">
      <div
        className={`p-2 rounded flex flex-col justify-center items-center ${
          isInputFocused ? 'border border-[#DFFE00]' : ''
        }`}
      >
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          className={`px-2 py-14 outline-none bg-transparent text-[#DFFE00] text-4xl uppercase text-center `}
          style={{
            textShadow: '1px 1px 1px #293B94, -1px -1px 1px #293B94',
          }}
          maxLength={20}
        />
      </div>
      <div className="flex flex-col items-center space-y-4">
        <div
          className="text-white text-center pb-2"
          style={{
            textShadow: '1px 1px 1px #293B94, -1px -1px 1px #293B94',
          }}
        >
          Pick yours:
        </div>

        {/* Botones de navegación y avatar */}
        <div className="flex items-center gap-4 flex-1">
          <button onClick={handlePreviousAvatar}>
            <Image
              src={
                'https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/flappymode/leftbtn'
              }
              alt="Selected Bird"
              width={80}
              height={80}
              className="w-auto h-8"
            />
          </button>
          <div className="w-60 flex items-center justify-center">
            <Image
              src={avatars[avatarIndex].src}
              alt="Selected Bird"
              width={80}
              height={80}
              className="w-auto h-28"
              style={{ filter: 'drop-shadow(0px 0px 5px #DFFE00)' }}
            />
          </div>
          <button onClick={handleNextAvatar}>
            <Image
              src={
                'https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/flappymode/rightbtn'
              }
              alt="Selected Bird"
              width={80}
              height={80}
              className="w-auto h-8"
            />
          </button>
        </div>
        <div
          className="text-white text-center pb-2"
          style={{
            textShadow: '1px 1px 1px #293B94, -1px -1px 1px #293B94',
          }}
        >
          {`tap - tap - tap!`}
        </div>
      </div>

      <button
        className="py-14"
        onClick={() => {
          if (playerName) {
            setGameStarted(true)
          } else {
            alert('Please enter your name.')
          }
        }}
      >
        <Image
          src="https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/flappymode/playbtn"
          alt="Flappy Play"
          width={80}
          height={80}
          className="w-auto h-28"
          style={{ filter: 'drop-shadow(1px 5px 5px rgb(147 197 253 / 0.6))' }}
        />
      </button>
    </div>
  )
}
