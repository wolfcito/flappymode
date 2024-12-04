'use client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { format } from 'numerable'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'

import Image from 'next/image'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function Leaderboard() {
  const [highScores, setHighScores] = useState<
    { nickname: string; score: number }[]
  >([])

  useEffect(() => {
    const fetchHighScores = async () => {
      try {
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
          setHighScores(scores || [])
        }
      } catch (error) {
        console.error('Unexpected error fetching high scores:', error)
      }
    }

    fetchHighScores()
  }, [])
  return (
    <>
      <h2 className="text-4xl font-bold px-4 py-6 text-[#DFFE00]">Rankings</h2>

      <div className="space-y-2 px-4">
        {/* <div className="bg-zinc-900 rounded-lg p-4 flex items-center justify-between font-sans">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 bg-[#B4E3DB]">
              <AvatarFallback className="text-black font-quickzap">
                WO
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">Wolfcito | Luis Fern...</p>
              <p className="text-gray-400">202,001 $veMode</p>
            </div>
          </div>
          <span className="text-gray-400">{'>'}100</span>
        </div> */}

        <h3 className="text-2xl font-bold py-4 text-[#DFFE00]">TOP 100</h3>

        <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pb-20 font-sans">
          {highScores.map((item, index) => (
            <div
              key={index}
              className="bg-zinc-900 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-black font-quickzap">
                    {item.nickname.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{item.nickname}</p>
                  <p className="text-gray-400">{item.score} points</p>
                </div>
              </div>

              {index <= 3 ? (
                <Image
                  src={
                    index === 1
                      ? 'https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/flappymode/goldmedal'
                      : index === 2
                      ? 'https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/flappymode/platemedal'
                      : 'https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/flappymode/coopermedal'
                  }
                  alt={`Rank ${index}`}
                  width={24}
                  height={24}
                  className="w-auto h-6"
                />
              ) : (
                <span className="text-gray-400">#{index}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
