'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { format } from 'numerable'
import { supabase } from '@/lib/supabase-client'

const GRAVITY = 0.5
const JUMP_STRENGTH = 10
const CANDLE_WIDTH = 30
const CANDLE_GAP = 200
const INITIAL_SPEED = 2
const SPEED_INCREMENT = 0.5

interface Candle {
  x: number
  height: number
  isTop: boolean
  isGreen: boolean
}

interface StartScreenProps {
  readonly playerName: string
  readonly setPlayerName: (value: string) => void
  readonly selectedBird: string
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
  const [highScores, setHighScores] = useState<
    { nickname: string; score: number }[]
  >([])
  const [scoreUpdated, setScoreUpdated] = useState(false)

  const jump = useCallback(() => {
    if (!gameOver && gameStarted) {
      setPlayerVelocity(-JUMP_STRENGTH)
    }
  }, [gameOver, gameStarted])

  useEffect(() => {
    const fetchHighScores = async () => {
      const { data: scores, error } = await supabase
        .from('high_scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching high scores:', error)
        setHighScores([])
      } else {
        setHighScores(scores || [])
      }
    }

    fetchHighScores()
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (!gameStarted && !gameOver) {
          setGameStarted(true)
        } else {
          jump()
        }
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [jump, gameStarted, gameOver])

  useEffect(() => {
    if (!gameStarted) return

    let lastLevel = level

    const gameLoop = setInterval(() => {
      if (gameOver) return

      setPlayerPosition((prevPosition) => {
        const newPosition = prevPosition + playerVelocity
        if (newPosition > 500 || newPosition < 0) {
          handleGameOver()
          return prevPosition
        }
        return newPosition
      })

      setPlayerVelocity((prevVelocity) => prevVelocity + GRAVITY)

      setCandles((prevCandles) => {
        const newCandles = prevCandles
          .map((candle) => ({ ...candle, x: candle.x - gameSpeed }))
          .filter((candle) => candle.x > -CANDLE_WIDTH)

        if (newCandles.length < 2) {
          const height = Math.random() * 200 + 100
          newCandles.push({
            x: 600,
            height,
            isTop: true,
            isGreen: Math.random() > 0.5,
          })
          newCandles.push({
            x: 600,
            height: 500 - height - CANDLE_GAP,
            isTop: false,
            isGreen: Math.random() > 0.5,
          })
        }

        return newCandles
      })

      setScore((prevScore) => {
        const newScore = prevScore + 1
        if (newScore % 1000 === 0 && lastLevel === level) {
          setGameSpeed((prevSpeed) => prevSpeed + SPEED_INCREMENT)
          setLevel((prevLevel) => prevLevel + 1)
          lastLevel++
        }
        return newScore
      })

      candles.forEach((candle) => {
        if (
          candle.x < 50 + 40 &&
          candle.x + CANDLE_WIDTH > 50 &&
          ((candle.isTop && playerPosition < candle.height) ||
            (!candle.isTop && playerPosition > 500 - candle.height))
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

  const handleScreenClick = () => {
    if (gameStarted && !gameOver) {
      jump()
    }
  }

  const handleGameOver = async () => {
    setGameOver(true)

    try {
      // Fetch current score using maybeSingle() to handle cases with no rows
      const { data: currentScore, error: fetchError } = await supabase
        .from('high_scores')
        .select('score')
        .eq('nickname', playerName)
        .maybeSingle() // Changed to maybeSingle()

      if (fetchError) {
        console.error('Error fetching current score:', fetchError.message)
        return
      }

      // If no score exists for this player, create a new record
      if (!currentScore) {
        console.log('No record found for player. Creating a new record...')

        const { data: newScoreData, error: insertError } = await supabase
          .from('high_scores')
          .insert({ nickname: playerName, score })

        if (insertError) {
          console.error(
            'Error creating new player record:',
            insertError.message,
          )
          return
        }

        console.log('New player record created successfully:', newScoreData)
        setScoreUpdated(true)
      } else if (score > currentScore.score) {
        // If the new score is higher, update the record
        const { data, error: upsertError } = await supabase
          .from('high_scores')
          .upsert({ nickname: playerName, score })

        if (upsertError) {
          console.error('Error updating score:', upsertError.message)
        } else {
          console.log('Score updated successfully:', data)
          setScoreUpdated(true)
        }
      } else {
        console.log('New score is not higher than the current score.')
        setScoreUpdated(false)
      }

      // Fetch top 10 high scores
      const { data: scores, error: fetchHighScoresError } = await supabase
        .from('high_scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(10)

      if (fetchHighScoresError) {
        console.error(
          'Error fetching high scores:',
          fetchHighScoresError.message,
        )
      } else {
        setHighScores(scores || [])
      }
    } catch (error) {
      console.error('Unexpected error in handleGameOver:', error)
    }
  }

  return (
    <div className="flex flex-col bg-[#52ef57] items-end justify-center">
      <div
        className="relative w-full max-w-[380px] gap-2 col"
        onClick={gameStarted ? handleScreenClick : undefined}
      >
        {!gameStarted && !gameOver && (
          <StartScreen
            setPlayerName={setPlayerName}
            playerName={playerName}
            setGameStarted={setGameStarted}
            selectedBird={selectedBird}
            setSelectedBird={setSelectedBird}
          />
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-between p-4 bg-black bg-opacity-90 z-10">
            <h2 className="text-3xl text-[#DFFE00] mb-4">Game Over</h2>

            <div className="text-center p-3 justify-center items-center flex flex-col h-max-[250px] w-2/6">
              <Image
                src={
                  selectedBird === 'bird1'
                    ? 'https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/mundovirtual/main-projects/mode-mastermind'
                    : selectedBird === 'bird2'
                    ? 'https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/mundovirtual/main-projects/mode-spray'
                    : 'https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/mundovirtual/main-projects/mochad'
                }
                alt="Selected Bird"
                width={80}
                height={80}
                className="rounded-full"
              />
              <p className="mb-4 text-lg text-white">{`Score: ${score}`}</p>
            </div>

            {scoreUpdated && (
              <div>
                <p className="text-center text-lg text-[#DFFE00] mb-4 px-3">{`"Mode is good, Mode is great,`}</p>
                <p className="text-center text-lg text-[#DFFE00] mb-4 px-3">{`we trust its power as of this date."`}</p>
              </div>
            )}

            <Button onclick={resetGame} label="Restart" />

            <h3 className="text-lg text-[#DFFE00]">Top 10 Leaderboard</h3>
            {highScores.map((entry, index) => (
              <div key={index} className="text-left text-white">
                {index + 1}. {entry.nickname}: {format(entry.score, '0.00 a')}
              </div>
            ))}
          </div>
        )}

        {/* avatar selected */}
        <div className="absolute inset-0 flex flex-col items-center justify-between p-4 bg-red-600  bg-opacity-90 z-10">
          <div className="w-10 h-10" style={{ top: playerPosition, left: 50 }}>
            <Image
              src={
                selectedBird === 'bird1'
                  ? 'https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/mundovirtual/main-projects/mode-mastermind'
                  : selectedBird === 'bird2'
                  ? 'https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/mundovirtual/main-projects/mode-spray'
                  : 'https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/mundovirtual/main-projects/mochad'
              }
              alt="Selected Bird"
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>

          {candles.map((candle, index) => (
            <div
              key={index}
              style={{
                backgroundColor: candle.isGreen ? '#00ff0050' : '#FF000050',
                left: candle.x,
                top: candle.isTop ? 0 : 500 - candle.height,
                width: CANDLE_WIDTH,
                height: candle.height,
                overflow: 'hidden',
              }}
            >
              <Image
                src={
                  candle.isGreen
                    ? 'https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/moddly/green-candle'
                    : 'https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/moddly/red-candle'
                }
                alt="Candle"
                width={CANDLE_WIDTH}
                height={candle.height}
                style={{ objectFit: 'cover' }}
              />
              <span>{candle.height}</span>
            </div>
          ))}
          <div className="flex flex-col gap-2 font-bold text-[#DFFE00] bg-black/50 md:text-lg text-sm">
            <div className="flex items-center gap-2">{`Score: ${score}`}</div>
            <div className="flex items-center gap-2">Level: {level}</div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-white">{`Press <spacebar> or click to jump`}</p>

      {/* <LeaderBoard highScores={highScores} /> */}
    </div>
  )
}

function StartScreen({
  playerName,
  setPlayerName,
  selectedBird,
  setSelectedBird,
  setGameStarted,
}: StartScreenProps) {
  const [isInputFocused, setIsInputFocused] = useState(false)
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between space-y-4 h-full">
      {/* <div className="absolute inset-0 flex flex-col items-center justify-between p-4 bg-blue-500 bg-opacity-90 z-10"></div> */}
      <div
        className={`p-2 rounded ${
          isInputFocused ? 'border border-[#DFFE00]' : ''
        }`}
      >
        <label className="text-[#DFFE00]">Nickname:</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          className={`px-2 py-1 outline-none bg-transparent text-white`}
          maxLength={20}
        />
      </div>
      <div>
        <label className="text-[#DFFE00]">Choose one:</label>
        <div className="flex gap-2">
          <Image
            src="https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/mundovirtual/main-projects/mode-mastermind"
            alt="Bird 1"
            width={60}
            height={60}
            className={`cursor-pointer ${
              selectedBird === 'bird1'
                ? 'border-2 border-[#DFFE00] m-1 p-1'
                : 'm-1 p-1'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedBird('bird1')
            }}
          />
          <Image
            src="https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/mundovirtual/main-projects/mode-spray"
            alt="Bird 2"
            width={60}
            height={60}
            className={`cursor-pointer ${
              selectedBird === 'bird2' ? 'border-2 border-[#DFFE00] m-1' : 'm-1'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedBird('bird2')
            }}
          />
          <Image
            src="https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/mundovirtual/main-projects/mochad"
            alt="Bird 3"
            width={60}
            height={60}
            className={`cursor-pointer ${
              selectedBird === 'bird3'
                ? 'border-2 border-[#DFFE00] m-1 p-1'
                : 'm-1 p-1'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedBird('bird3')
            }}
          />
        </div>
      </div>
      <Button
        onclick={() => {
          if (selectedBird && playerName) {
            setGameStarted(true)
          } else {
            alert('Please enter your name and select a bird.')
          }
        }}
        label="Start Game"
      />
    </div>
  )
}

function LeaderBoard({
  highScores,
}: {
  highScores: { nickname: string; score: number }[]
}) {
  return (
    <div className="absolute top-4 right-4 text-[#DFFE00] bg-black/50 p-2">
      <h3 className="text-lg">High Scores</h3>
      <ul>
        {highScores.map((entry, index) => (
          <li key={index} className="text-white">
            {index + 1}. {entry.nickname}: {format(entry.score, '0.00 a')}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Button({ onclick, label }: { onclick: () => void; label: string }) {
  return (
    <button
      onClick={onclick}
      className="text-base px-4 p-1 bg-[#DFFE00] text-[#000000] hover:bg-[#DFFE00]/90 mt-4 cursor-pointer"
    >
      {label}
    </button>
  )
}
